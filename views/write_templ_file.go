package views

import (
	"context"
	"os"
	"path"

	locallogger "dbVisualizer.com/localLogger"
	"dbVisualizer.com/localdb"
)

func TemplWriteToFile(logger *locallogger.Logger, file_name string, nodes []*localdb.ColumnSchema) {
	dir, err := os.Getwd()
	if err != nil {
		logger.Log("Could not get current working directory: " + err.Error())
		os.Exit(1)
	}

	html_file := path.Join(dir, file_name+".html")

	f, err := os.Create(html_file)
	if err != nil {
		logger.Log("Could not write create file: " + err.Error())
		os.Exit(1)
	}

	defer f.Close()

	err = Viewer().Render(context.Background(), f)
	if err != nil {
		logger.Log("Could not write to file: " + err.Error())
		os.Exit(1)
	}
}

/*

We need to be able to recusively render all nodes that are incoming

*/
