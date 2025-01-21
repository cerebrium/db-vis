package localdb

import (
	"database/sql"
	"fmt"
)

func Connect(db_name string, db_user_name string) (*sql.DB, error) {
	const (
		host string = "localhost"
		port int    = 5432
	)

	dsn := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable",
		host, port, db_user_name, db_name)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	defer db.Close()

	return db, nil
}
