package localdb

// CODE REVIEW
import (
	"os"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func Walk(dbd *DBDetails) error {
	dbd.Logger.Log("before db connect: " + dbd.Name + "\n Connecting to table: " + dbd.Table + "\n")
	if dbd.Conn != nil {
		dbd.Conn.WriteMessage(websocket.TextMessage, []byte("Fetching data"))
	}

	dbd.Logger.Log("before db connect: " + dbd.Name + "\n Connecting to table: " + dbd.Table + "\n")

	err := dbd.connect()
	if err != nil {
		return err
	}

	// Internal logging
	dbd.Logger.Log("Connected to database: " + dbd.Name + "\n Connecting to table: " + dbd.Table + "\n")

	// Actually write to the struct
	dbd.schemaWalk(&dbd.Schema, dbd.Table)

	// Append the top level table to visited
	dbd.visitedTables[dbd.Table] = true

	dbd.Logger.Log("past initial schema walk: ")

	// We want to be able to perform child walks concurrently.
	for i := 0; i < len(dbd.Schema); i++ {
		if dbd.Schema[i].ReferencesAnotherTable {

			dbd.wg.Add(1)
			go dbd.child_walk(*dbd.Schema[i].ReferencedTableName, &dbd.Schema[i].Children)
		}
	}

	dbd.wg.Wait()

	// Close after walking
	defer dbd.dbConn.Close()

	dbd.Logger.Log("Inside the get data call")
	// The cli process is not done yet

	dbd.Logger.Log("The name: " + dbd.Name)

	if dbd.Conn != nil {
		dbd.Conn.WriteJSON(dbd)
	}

	return nil
}

// This means that we have cases where there are potential circular references in
// the referencesOtherTables, but not in the children... On the frontend, we will
// have some circular references that are not handled by the ref replacment. With
// those we need to say 'if x.references_another_table && not x.children -> hightlight
// integer as being incomplete'
func (dbd *DBDetails) child_walk(table_name string, children *[]*ColumnSchema) {
	defer dbd.wg.Done()

	// TODO: Think about this mutex. The map shouldn't have conflicting values, however,
	// if we could have circular issues if a thread gets ahead of another thread and then
	// we look into tables that we shouldn't.
	// So far, there have been no circular issues experienced, but it is a risk, however
	// the mutex will slow things down, and could be unnecessary.
	// @Code Review extra focus
	dbd.mu.Lock()

	// We can read lots
	if dbd.visitedTables[table_name] {
		dbd.mu.Unlock()
		return
	}

	// Before the visitedTables is mutated, write lock
	dbd.visitedTables[table_name] = true

	dbd.mu.Unlock()

	dbd.schemaWalk(children, table_name)

	// Walk its children and recursively grab all data
	for i := 0; i < len(*children); i++ {
		if (*children)[i].ReferencesAnotherTable {
			dbd.wg.Add(1)

			dbd.Logger.Log("added a wg ")
			go dbd.child_walk(*(*children)[i].ReferencedTableName, &(*children)[i].Children)
		}
	}
}

func (dbd *DBDetails) schemaWalk(current_schema_arr *[]*ColumnSchema, table_name string) {
	query := `
		SELECT
		    c.column_name,
		    c.data_type,
		    c.is_nullable = 'YES' AS is_nullable,
		    CASE
		        WHEN tc.constraint_type = 'FOREIGN KEY' THEN TRUE
		        ELSE FALSE
		    END AS references_another_table,
		    ccu.table_name AS referenced_table_name
		FROM
		    information_schema.columns AS c
		LEFT JOIN
		    information_schema.key_column_usage AS kcu
		    ON c.table_name = kcu.table_name
		    AND c.column_name = kcu.column_name
		LEFT JOIN
		    information_schema.table_constraints AS tc
		    ON kcu.constraint_name = tc.constraint_name
		    AND tc.constraint_type = 'FOREIGN KEY'
		LEFT JOIN
		    information_schema.constraint_column_usage AS ccu
		    ON tc.constraint_name = ccu.constraint_name
		WHERE
		    c.table_name = $1;
			`

	// Execute the query
	rows, err := dbd.dbConn.Query(query, table_name)
	if err != nil {
		dbd.Logger.Log("Error getting schema details for: " + dbd.Name + "\nTable: " + dbd.Table)
		rows.Close()
		os.Exit(1)
	}

	defer rows.Close()

	// Parse the results
	for rows.Next() {
		col := &ColumnSchema{}

		err := rows.Scan(
			&col.ColumnName,
			&col.DataType,
			&col.IsNullable,
			&col.ReferencesAnotherTable,
			&col.ReferencedTableName)
		if err != nil {
			dbd.Logger.Log("Error scanning rows: " + dbd.Name + "\n Table: " + table_name + "\n Error: " + err.Error())
			os.Exit(1)
		}

		col.Table = table_name
		col.Id = uuid.New().String()

		// In case we need to add children always append this
		col.Children = []*ColumnSchema{}

		*current_schema_arr = append(*current_schema_arr, col)
	}

	// Check for any error encountered during iteration
	if err := rows.Err(); err != nil {
		dbd.Logger.Log("Error scanning rows: " + dbd.Name + "\n Table: " + table_name + "\n Error: " + err.Error())
		os.Exit(1)
	}
}
