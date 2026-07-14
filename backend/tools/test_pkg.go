//go:build ignore

package main

import (
	"encoding/json"
	"fmt"
	"lim-system/database"
	"lim-system/models"
)

func main() {
	database.ConnectDB()
	var pkgs []models.TestingPackage
	database.DB.Find(&pkgs)
	b, _ := json.MarshalIndent(pkgs, "", "  ")
	fmt.Println(string(b))
}
