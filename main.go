package main

import (
	"fmt"
	"os"

	appstate "dbVisualizer.com/appState"
	locallogger "dbVisualizer.com/localLogger"
	tea "github.com/charmbracelet/bubbletea"
)

func main() {
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
