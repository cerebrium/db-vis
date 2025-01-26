package routes

import (
	"fmt"
	"net/http"

	"dbVisualizer.com/localdb"
	"github.com/labstack/echo/v4"
)

type Response struct {
	Name string `json:"Name"`
}

func GetDbData(c echo.Context, dbd *localdb.DBDetails) error {
	fmt.Println("INSIDE THE GET DB DATA")
	dbd.Logger.Log("Inside the get data call")
	// The cli process is not done yet
	if dbd.Name == "" {
		return c.JSON(http.StatusNoContent, "")
	}

	dbd.Logger.Log("The name: " + dbd.Name)

	res := Response{
		Name: dbd.Name,
	}

	return c.JSON(http.StatusOK, res)
}
