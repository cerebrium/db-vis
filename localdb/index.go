package localdb

import (
	"database/sql"
	"fmt"
	"os"

	locallogger "dbVisualizer.com/localLogger"
	_ "github.com/lib/pq" // Import the PostgreSQL driver
)

type ColumnSchema struct {
	ColumnName             string          `json:"column_name"`
	DataType               string          `json:"data_type"`
	IsNullable             string          `json:"is_nullable"`
	ReferencesAnotherTable bool            `json:"references_another_table"`
	ReferencedTableName    *string         `json:"referenced_table_name,omitempty"`
	Children               []*ColumnSchema `json:"children,omitempty"`
}

type DBDetails struct {
	Name          string `json:"name"`
	Table         string `json:"table"`
	IsSchema      bool   `json:"is_schema"`
	UserName      string `json:"user_name"`
	dbConn        *sql.DB
	Logger        *locallogger.Logger // Anywhere there is state, there are logs
	visitedTables []string
	Schema        []*ColumnSchema `json:"schema"`
}

func CreateDbDetails(isSchema bool, name string, table string, userName string, logger *locallogger.Logger) *DBDetails {
	DbD := DBDetails{
		IsSchema:      isSchema,
		Name:          name,
		Table:         table,
		UserName:      userName,
		Logger:        logger,
		visitedTables: []string{},
	}

	return &DbD
}

func (dbd *DBDetails) connect() {
	const (
		host string = "localhost"
		port int    = 5432
	)

	dsn := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable",
		host, port, dbd.UserName, dbd.Name)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		dbd.Logger.Log("Error in opening db connection" + err.Error())
		os.Exit(1)
	}

	if err = db.Ping(); err != nil {
		dbd.Logger.Log("Error in pinging db: " + err.Error())
		os.Exit(1)
	}

	dbd.dbConn = db
}
