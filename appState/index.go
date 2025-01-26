package appstate

import (
	locallogger "dbVisualizer.com/localLogger"
	"dbVisualizer.com/localdb"
)

type Model struct {
	step     int                 // Have they passed the intro
	choices  []string            // items on the to-do list
	cursor   int                 // which to-do list item our cursor is pointing at
	selected map[int]struct{}    // which to-do items are selected
	Logger   *locallogger.Logger // Anywhere there is state, there are logs
	Dbd      *localdb.DBDetails  // We need to be able to access the processed info from the echo routes
}

func (m *Model) GetState() *Model {
	return m
}
