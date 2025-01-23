package localdb

import (
	"os"
	"slices"

	"github.com/charmbracelet/log"
)

func Walk(dbd *DBDetails) {
	log.Info("Connecting to database")
	dbd.connect()

	// Internal logging
	dbd.logger.Log("Connected to database: " + dbd.name + "\n Connecting to table: " + dbd.table)

	log.Info("Walking schema for table: " + dbd.table)

	// Actually write to the struct
	dbd.schemaWalk(dbd.Schema, dbd.table)

	// Tell the user stuff is happening
	log.Info("Walked schema for table: " + dbd.table)
	log.Info("Walking children for table: " + dbd.table)

	// Append the top level table to visited
	dbd.visitedTables = append(dbd.visitedTables, dbd.table)

	// Walk the children of the first query
	for i := 0; i < len(dbd.Schema); i++ {
		if dbd.Schema[i].ReferencesAnotherTable {
			dbd.child_walk(*dbd.Schema[i].ReferencedTableName, dbd.Schema[i].Children)
		}
	}

	log.Info("Past child walk")

	for i := 0; i < len(dbd.Schema); i++ {
		if len(dbd.Schema[i].Children) > 0 {
			for c := 0; c < len(dbd.Schema[i].Children); c++ {
				dbd.logger.Log("child val: " + dbd.Schema[i].Children[c].ColumnName)
			}
		}
	}

	// Close after walking
	defer dbd.dbConn.Close()
}

// TODO: We don't want circular queries, it will be forever... literally, however,
// multiple children might reference a table differently, we still want to
// represent that.
func (dbd *DBDetails) child_walk(table_name string, children []*ColumnSchema) {
	if slices.Contains(dbd.visitedTables, table_name) {
		return
	}

	dbd.visitedTables = append(dbd.visitedTables, table_name)

	dbd.schemaWalk(children, table_name)

	// Walk its children and recursively grab all data
	for i := 0; i < len(children); i++ {
		if children[i].ReferencesAnotherTable {
			dbd.child_walk(*children[i].ReferencedTableName, children[i].Children)
		}
	}
}

func (dbd *DBDetails) schemaWalk(current_schema_arr []*ColumnSchema, table_name string) {
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
		dbd.logger.Log("Error getting schema details for: " + dbd.name + "\nTable: " + dbd.table)
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
		// &col.ColumnName, &col.DataType, &col.IsNullable)
		if err != nil {
			dbd.logger.Log("Error scanning rows: " + dbd.name + "\n Table: " + dbd.table + "\n Error: " + err.Error())
			os.Exit(1)
		}

		// In case we need to add children always append this
		col.Children = []*ColumnSchema{}

		current_schema_arr = append(current_schema_arr, col)
	}

	// Check for any error encountered during iteration
	if err := rows.Err(); err != nil {
		dbd.logger.Log("Error scanning rows: " + dbd.name + "\n Table: " + dbd.table + "\n Error: " + err.Error())
		os.Exit(1)
	}
}
