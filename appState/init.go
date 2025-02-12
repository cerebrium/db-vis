package appstate

import (
	locallogger "dbVisualizer.com/localLogger"
	"dbVisualizer.com/localdb"
	tea "github.com/charmbracelet/bubbletea"
)

func InitialModel(l *locallogger.Logger, dbd *localdb.DBDetails) Model {
	return Model{
		// Our to-do list is a grocery list
		choices: []string{"db schema", "table row -> do not select (future feature)"},

		// A map which indicates which choices are selected. We're using
		// the  map like a mathematical set. The keys refer to the indexes
		// of the `choices` slice, above.
		selected: make(map[int]struct{}),
		Logger:   l,
		Dbd:      dbd,
	}
}

func (m Model) Init() tea.Cmd {
	// Just return `nil`, which means "no I/O right now, please."
	return nil
}
