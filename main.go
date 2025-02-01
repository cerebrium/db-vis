package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	appstate "dbVisualizer.com/appState"
	locallogger "dbVisualizer.com/localLogger"
	"dbVisualizer.com/localdb"
	"dbVisualizer.com/routes"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/labstack/echo-contrib/echoprometheus"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

type GlobalState struct {
	m *appstate.Model
}

func main() {
	// We will need to pass state back and forth between the two
	// apps that are running. The cli has a global state object,
	// that will need to be jsonified and sent to the react fe
	// through the echo routes.

	// Serve the cli here
	// Handle logging in local
	l, err := locallogger.CreateLogger()
	if err != nil {
		fmt.Println("Could not create the logger")
		os.Exit(1)
	}

	defer l.File.Close()

	// Define the global state objects before the thread
	dbd := localdb.CreateDbDetails(false, "", "", "", l)
	model_state := appstate.InitialModel(l, dbd)

	// Serve the react app here
	go func(dbd *localdb.DBDetails) {
		app := echo.New()

		logFile, err := os.OpenFile("echo_server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Fatalf("Failed to create log file: %v\n", err)
		}
		defer logFile.Close()

		app.Logger.SetOutput(logFile)

		// Middleware for whole app
		// Golang equivilant of helmet for node
		app.Use(middleware.Secure())

		// We don't want long running anything. If
		// we end up openeing sockets at some point
		// then we can reconsider.
		app.Use(middleware.Timeout())

		// Logger
		app.Use(middleware.Logger())

		// Allow panics not to crash the server
		app.Use(middleware.Recover())

		// Just start with a blocker for many requests
		app.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(20))))

		// CORS
		app.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: []string{"http://localhost:42069"},
			AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		}))

		// adds middleware to gather metrics
		app.Use(echoprometheus.NewMiddleware("prate"))

		app.Static("/assets", "frontend/dist/assets")

		app.GET("/*", func(c echo.Context) error {
			return c.File(filepath.Join("frontend", "dist", "index.html"))
		})

		// We want to make this be a websocket so that each time
		// the user updates the cli, the data is sent to the fe.
		app.GET("/api/get_data", func(c echo.Context) error {
			// Upgrade to websocket, and return ref to conn
			conn, err := routes.UpgradeConnection(c, dbd.Logger)
			if err != nil {
				dbd.Logger.Log("Error from upgrade: " + err.Error())
				os.Exit(1)
			}

			defer conn.Close()

			dbd.Conn = conn
			for {
				// We don't expect the fe to make any requests. Those are handled by the cli
				// But for local dev, want to just get the data
				_, a, err := conn.ReadMessage()
				if err != nil {
					break
				}

				if a != nil {
					fmt.Println("requesting data")

					if dbd.Schema != nil {
						dbd.Conn.WriteJSON(dbd)
					}
				}
			}
			return nil
		})

		app.Logger.Fatal(app.Start(":42069"))
	}(dbd)

	p := tea.NewProgram(model_state)

	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}

	// Handle graceful shutdown
	// TODO: figure out if i need this
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		fmt.Println("\nShutting down gracefully...")
		os.Exit(0)
	}()
}
