//go:build ignore

package main

import (
	"fmt"
	"log"
	"os"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Warning: .env not found: %v", err)
	}

	cEnv := os.Getenv("CAMUNDA_ENV")
	mEnv := os.Getenv("MINIO_ENV")

	fmt.Printf("CAMUNDA_ENV: %q (bytes: %v)\n", cEnv, []byte(cEnv))
	fmt.Printf("MINIO_ENV:   %q (bytes: %v)\n", mEnv, []byte(mEnv))
}
