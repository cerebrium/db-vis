package appstate

import (
	"fmt"
)

/*
*
The View Method

At last, it’s time to render our UI. Of all the methods, the view is the simplest. We look at the
model in its current state and use it to return a string. That string is our UI!

Because the view describes the entire UI of your application, you don’t have to worry about redrawing
logic and stuff like that. Bubble Tea takes care of it for you.
*
*/
func (m Model) View() string {
	// The header
	s := "Would you like produce a schema view, or track one row?\n\n"

	// Iterate over our choices
	for i, choice := range m.choices {

		// Is the cursor pointing at this choice?
		cursor := " " // no cursor
		if m.cursor == i {
			cursor = ">" // cursor!
		}

		// Is this choice selected?
		checked := " " // not selected
		if _, ok := m.selected[i]; ok {
			checked = "x" // selected!
		}

		// Render the row
		s += fmt.Sprintf("%s [%s] %s\n", cursor, checked, choice)
	}

	// The footer
	s += "\nPress q to quit.\n"

	// Send the UI for rendering
	return s
}