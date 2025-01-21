package locallogger

import (
	"fmt"
	"os"
	"path"
	"time"
)

type Logger struct {
	path string
	File *os.File
}

func newLogLocation(path string) *Logger {
	LL := Logger{
		path: path,
		File: nil,
	}

	return &LL
}

func CreateLogger() (*Logger, error) {
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	log_file := path.Join(dir, "/logs.txt")

	fmt.Println("LOCATION for the file: ", log_file)

	loc := newLogLocation(log_file)

	f, err := os.OpenFile(loc.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	current_time := time.Now().Format("2006.01.02 15:04:05")
	str_to_write := "\n\n" + current_time + "\n\n"

	_, err = f.Write([]byte(str_to_write))
	if err != nil {
		// Try to write create the file then write
		return nil, err
	}

	// Store for later writes
	loc.File = f

	return loc, nil
}

func (l *Logger) Log(str string) {
	fmt.Printf("File descriptor: %v\n", l.File.Fd())

	_, err := l.File.Write([]byte(str))
	if err != nil {
		fmt.Println("Error in writer: ", err)
		os.Exit(1)
	}
}
