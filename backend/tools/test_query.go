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
	var app models.TestingApplication
	err := database.DB.Preload("TestingReportAi").First(&app, 196).Error
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	b, _ := json.MarshalIndent(app.TestingReportAi, "", "   ")
	fmt.Println("Report AI:", string(b))
}
