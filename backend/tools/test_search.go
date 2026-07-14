//go:build ignore

package main

import (
	"fmt"
	"lim-system/database"
	"lim-system/models"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func main() {
	cwd, _ := os.Getwd()
	err := godotenv.Load(filepath.Join(cwd, ".env"))
	if err != nil {
		log.Println("No .env file found or error loading it")
	}

	database.InitDB()

	query := database.DB.Model(&models.MaterialCategory{})
	search := "senjata"
	query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")

	var total int64
	query.Count(&total)

	var items []models.MaterialCategory
	err = query.Order("name asc").Limit(10).Offset(0).Find(&items).Error
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Total:", total)
	fmt.Printf("Items: %+v\n", items)
}
