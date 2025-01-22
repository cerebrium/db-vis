package appstate

import locallogger "dbVisualizer.com/localLogger"

type Model struct {
	step     int                 // Have they passed the intro
	choices  []string            // items on the to-do list
	cursor   int                 // which to-do list item our cursor is pointing at
	selected map[int]struct{}    // which to-do items are selected
	logger   *locallogger.Logger // Anywhere there is state, there are logs
}
