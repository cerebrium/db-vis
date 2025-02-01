package appstate

import (
	"fmt"
	"os"

	"dbVisualizer.com/localdb"
	tea "github.com/charmbracelet/bubbletea"
)

/*
The Update Method
Next up is the update method. The update function is called when ”things happen.” Its job is to look
at what has happened and return an updated model in response. It can also return a Cmd to make more
things happen, but for now don't worry about that part.

In our case, when a user presses the down arrow, Update’s job is to notice that the down arrow was
pressed and move the cursor accordingly (or not).

The “something happened” comes in the form of a Msg, which can be any type. Messages are the result
of some I/O that took place, such as a keypress, timer tick, or a response from a server.

We usually figure out which type of Msg we received with a type switch, but you could also use a type
assertion.

For now, we'll just deal with tea.KeyMsg messages, which are automatically sent to the update
function when keys are pressed.
*/
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		// These keys should exit the program.
		case "ctrl+c", "q":
			return m, tea.Quit

		// The "up" and "k" keys move the cursor up
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}

		// The "down" and "j" keys move the cursor down
		case "down", "j":

			if m.cursor < len(m.choices)-1 {
				m.cursor++
			}

		// The "enter" key and the spacebar (a literal space) toggle
		// the selected state for the item that the cursor is pointing at.
		case "enter", " ":
			_, ok := m.selected[m.cursor]
			if ok {
				delete(m.selected, m.cursor)
			} else {
				m.selected[m.cursor] = struct{}{}
			}

			fmt.Println("Beggining the quest for data!")
			var isSchema bool

			if m.cursor == 1 {
				isSchema = true
			} else {
				isSchema = false
			}

			name, table, userName := m.SchemaView()

			m.Dbd.Name = name
			m.Dbd.Table = table
			m.Dbd.UserName = userName
			m.Dbd.IsSchema = isSchema

			fmt.Println("Connecting")

			err := localdb.Walk(m.Dbd)
			if err != nil {
				m.Logger.Log("Was an error returned from walk: " + err.Error())
				os.Exit(1)
			}

			fmt.Println("Done searching: please go to localhost:42069")

			// TODO: make an infinite loop that lets the user search for more
			// queries. It will take the schema name only

		}
	}

	// Return the updated model to the Bubble Tea runtime for processing.
	// Note that we're not returning a command.
	return m, nil
}
