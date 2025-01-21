package appstate

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
)

func ShouldDebug() {
	if len(os.Getenv("DEBUG")) > 0 {
		f, err := tea.LogToFile("~/Desktop/code/debug.log", "debug")
		if err != nil {
			fmt.Println("fatal:", err)
			os.Exit(1)
		}
		defer f.Close()
	}
}
