package localdb

import (
	"os"

	"github.com/charmbracelet/log"
)

func Walk(dbd *DBDetails) {
	log.Info("Connecting to database")
	dbd.connect()

	dbd.logger.Log("Connected to database: " + dbd.name + "\n Connecting to table: " + dbd.table)

	log.Info("Walking schema for table: " + dbd.table)
	dbd.SchemaWalk()
	log.Info("Walked schema for table: " + dbd.table)

	log.Info("Walking children for table: " + dbd.table)

	for i := 0; i < len(dbd.Schema); i++ {
		dbd.logger.Log("Column name: " + dbd.Schema[i].ColumnName + "\n")
		dbd.logger.Log("Data type: " + dbd.Schema[i].DataType + "\n")
		if dbd.Schema[i].ReferencesAnotherTable {

			dbd.logger.Log("IsNullable: " + dbd.Schema[i].IsNullable + "\n")
			dbd.logger.Log("ForeignTableName: " + *dbd.Schema[i].ReferencedTableName + "\n--------------------------\n")
		} else {
			dbd.logger.Log("IsNullable: " + dbd.Schema[i].IsNullable + "\n--------------------------\n")
		}
	}

	// Close after walking
	defer dbd.dbConn.Close()
}

// func (dbd *DBDetails) child_walk() {
// }

func (dbd *DBDetails) SchemaWalk() {
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
	rows, err := dbd.dbConn.Query(query, dbd.table)
	if err != nil {
		dbd.logger.Log("Error getting schema details for: " + dbd.name + "\nTable: " + dbd.table)
		rows.Close()
		os.Exit(1)
	}

	defer rows.Close()

	// Parse the results
	var schema []*ColumnSchema
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

		schema = append(schema, col)
	}

	// Check for any error encountered during iteration
	if err := rows.Err(); err != nil {
		dbd.logger.Log("Error scanning rows: " + dbd.name + "\n Table: " + dbd.table + "\n Error: " + err.Error())
		os.Exit(1)
	}

	dbd.Schema = schema
}
