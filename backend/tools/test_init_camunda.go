//go:build ignore

package main

import (
	"fmt"
	"log"
	"lim-system/services"
	"os"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Warning: .env not found: %v", err)
	}

	fmt.Printf("BEFORE INIT: CAMUNDA_ENV=%q\n", os.Getenv("CAMUNDA_ENV"))
	services.InitCamunda()
	fmt.Printf("AFTER INIT: Camunda=%T\n", services.Camunda)
}
