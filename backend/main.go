package main

import (
	"fmt"
	"log"
	"lim-system/controllers"
	"lim-system/routes"
	"lim-system/services"
	"lim-system/database"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err1 := godotenv.Load(".env")
	err2 := godotenv.Load("../.env")
	if err1 != nil && err2 != nil {
		log.Println("Note: No .env file found in root or current directory, using system env")
	}

	// Set Gin mode
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = gin.DebugMode
	}
	gin.SetMode(ginMode)

	controllers.BootTime = time.Now()

	// Initialize database
	database.InitDB()

	// Initialize ONNX Runtime if enabled in database (platform-specific)
	initONNXRuntime()
	defer destroyONNXRuntime()

	// Initialize services
	services.InitMinio()
	services.InitCamunda()

	r := gin.Default()
	r.SetTrustedProxies([]string{"127.0.0.1"})

	// Initialize routes
	routes.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	sslCert := os.Getenv("SSL_CERT_PATH")
	sslKey := os.Getenv("SSL_KEY_PATH")

	// Fallback to default mkcert names if env not set
	if sslCert == "" {
		sslCert = "lims.local.pem"
	}
	if sslKey == "" {
		sslKey = "lims.local-key.pem"
	}

	if sslCert != "" && sslCert != "OFF" {
		if _, err := os.Stat(sslCert); err == nil {
			fmt.Printf("Starting HTTPS server on https://%s:%s...\n", os.Getenv("SERVER_DOMAIN"), port)
			if err := r.RunTLS(":"+port, sslCert, sslKey); err != nil {
				log.Fatalf("Failed to start HTTPS server: %v", err)
			}
			return
		}
	}

	fmt.Printf("Starting HTTP server on http://localhost:%s...\n", port)
	r.Run(":" + port)
}
