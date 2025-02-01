package routes

import (
	"net/http"
	"os"

	locallogger "dbVisualizer.com/localLogger"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // We are never in production, so we want all connections
	},
}

func UpgradeConnection(c echo.Context, l *locallogger.Logger) (*websocket.Conn, error) {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		l.Log("Error in upgrading connection: " + err.Error())
		os.Exit(1)
	}

	return conn, nil
}
