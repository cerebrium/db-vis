package appstate

import (
	locallogger "dbVisualizer.com/localLogger"
	tea "github.com/charmbracelet/bubbletea"
)

func InitialModel(l *locallogger.Logger) Model {
	return Model{
		// Our to-do list is a grocery list
		choices: []string{"db schema", "table row"},

		// A map which indicates which choices are selected. We're using
		// the  map like a mathematical set. The keys refer to the indexes
		// of the `choices` slice, above.
		selected: make(map[int]struct{}),
		logger:   l,
	}
}

func (m Model) Init() tea.Cmd {
	// Just return `nil`, which means "no I/O right now, please."
	return nil
}
