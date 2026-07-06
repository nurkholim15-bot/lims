//go:build ignore
package main

import (
	"log"
	"lim-system/models"
	"lim-system/database"
	"github.com/joho/godotenv"
)

func main() {
	// Load env
	godotenv.Load(".env")
	godotenv.Load("../.env")

	log.Println("Initializing Database...")
	database.InitDB()

	log.Println("Starting Migration for AssetHandover...")
	
	// Manually drop partner_code if it exists (GORM won't do this)
	err := database.DB.Exec("ALTER TABLE asset_handovers DROP COLUMN IF EXISTS partner_code").Error
	if err != nil {
		log.Printf("Warning: Failed to drop partner_code: %v", err)
	}

	// AutoMigrate will add partner_id
	err = database.DB.AutoMigrate(&models.AssetHandover{})
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration successful! Column partner_id added and partner_code removed.")
}
