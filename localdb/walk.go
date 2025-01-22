package localdb

import (
	"os"
)

func Walk(dbd *DBDetails) {
	dbd.connect()

	dbd.logger.Log("Connected to database: " + dbd.name + "\n Connecting to table: " + dbd.table)
	dbd.SchemaWalk()

	for i := 0; i < len(dbd.Schema); i++ {
		dbd.logger.Log("Column name: " + dbd.Schema[i].ColumnName + "\n")
		dbd.logger.Log("Data type: " + dbd.Schema[i].DataType + "\n")
		dbd.logger.Log("IsNullable: " + dbd.Schema[i].IsNullable + "\n--------------------------\n")
	}

	// Close after walking
	defer dbd.dbConn.Close()
}

func (dbd *DBDetails) SchemaWalk() {
	// Query to fetch the table schema
	query := `
	SELECT column_name, data_type, is_nullable
	FROM information_schema.columns
	WHERE table_name = $1;
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

		err := rows.Scan(&col.ColumnName, &col.DataType, &col.IsNullable)
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
