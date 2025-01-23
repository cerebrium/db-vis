package localdb

import (
	"database/sql"
	"fmt"
	"os"

	locallogger "dbVisualizer.com/localLogger"
	_ "github.com/lib/pq" // Import the PostgreSQL driver
)

type ColumnSchema struct {
	ColumnName             string
	DataType               string
	IsNullable             string
	ReferencesAnotherTable bool
	ReferencedTableName    *string
}

type DBDetails struct {
	name     string
	table    string
	isSchema bool
	userName string
	dbConn   *sql.DB
	logger   *locallogger.Logger // Anywhere there is state, there are logs
	Schema   []*ColumnSchema
}

func CreateDbDetails(isSchema bool, name string, table string, userName string, logger *locallogger.Logger) *DBDetails {
	DbD := DBDetails{
		isSchema: isSchema,
		name:     name,
		table:    table,
		userName: userName,
		logger:   logger,
	}

	return &DbD
}

func (dbd *DBDetails) connect() {
	const (
		host string = "localhost"
		port int    = 5432
	)

	dsn := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable",
		host, port, dbd.userName, dbd.name)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		dbd.logger.Log("Error in opening db connection" + err.Error())
		os.Exit(1)
	}

	if err = db.Ping(); err != nil {
		dbd.logger.Log("Error in pinging db: " + err.Error())
		os.Exit(1)
	}

	dbd.dbConn = db
}
