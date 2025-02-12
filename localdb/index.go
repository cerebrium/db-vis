package localdb

import (
	"database/sql"
	"fmt"
	"sync"

	locallogger "dbVisualizer.com/localLogger"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq" // Import the PostgreSQL driver
)

type ColumnSchema struct {
	Id                     string          `json:"id"`
	ColumnName             string          `json:"column_name"`
	DataType               string          `json:"data_type"`
	IsNullable             string          `json:"is_nullable"`
	ReferencesAnotherTable bool            `json:"references_another_table"`
	ReferencedTableName    *string         `json:"referenced_table_name,omitempty"`
	Table                  string          `json:"table"`
	Children               []*ColumnSchema `json:"children,omitempty"`
}

type DBDetails struct {
	Name          string `json:"name"`
	Table         string `json:"table"`
	IsSchema      bool   `json:"is_schema"`
	UserName      string `json:"user_name"`
	dbConn        *sql.DB
	Logger        *locallogger.Logger // Anywhere there is state, there are logs
	visitedTables map[string]bool     // we have cases where much higher than 30, so map more optimized
	Schema        []*ColumnSchema     `json:"schema"`
	Conn          *websocket.Conn
	mu            sync.RWMutex
	wg            sync.WaitGroup
	Password      string
}

func CreateDbDetails(isSchema bool, name string, table string, userName string, logger *locallogger.Logger) *DBDetails {
	DbD := DBDetails{
		IsSchema:      isSchema,
		Name:          name,
		Table:         table,
		UserName:      userName,
		Logger:        logger,
		visitedTables: make(map[string]bool),
	}

	return &DbD
}

func (dbd *DBDetails) connect() error {
	const (
		host string = "localhost"
		port int    = 5432
	)

	dsn := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable password=%s",
		host, port, dbd.UserName, dbd.Name, dbd.Password)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		dbd.Logger.Log("Error in opening db connection" + err.Error())
		return err
	}

	if err = db.Ping(); err != nil {
		dbd.Logger.Log("Error in pinging db: " + err.Error())
		return err
	}

	dbd.dbConn = db
	return nil
}
