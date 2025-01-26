package main

import (
	"fmt"
	"os"

	appstate "dbVisualizer.com/appState"
	locallogger "dbVisualizer.com/localLogger"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/echoprometheus"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

func main() {
	app := echo.New()

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
		AllowOrigins: []string{"http://localhost:42069", "https://prate.pro/"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	// adds middleware to gather metrics
	app.Use(echoprometheus.NewMiddleware("prate"))

	// Serve the htmx and other assets
	// app.Static("/assets", "assets")

	// Serve static files (React build folder)
	app.Static("/", "frontend/dist")

	// Handle SPA (Single Page Application)
	app.GET("/*", func(c echo.Context) error {
		return c.File("frontend/dist/index.html")
	})

	app.Logger.Fatal(app.Start(":42069"))

	// Handle logging in local
	l, err := locallogger.CreateLogger()
	if err != nil {
		fmt.Println("Could not create the logger")
		os.Exit(1)
	}

	defer l.File.Close()

	p := tea.NewProgram(appstate.InitialModel(l))

	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
