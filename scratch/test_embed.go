package main

import (
	"embed"
	"fmt"
	"io/fs"
)

//go:embed web/dist
var buildFS embed.FS

func main() {
	fs.WalkDir(buildFS, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		fmt.Println(path)
		return nil
	})
}
