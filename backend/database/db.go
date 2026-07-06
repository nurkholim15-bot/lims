package database

import (
	"fmt"
	"log"
	"lim-system/models"
	"lim-system/utils"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var ChatBotDB *gorm.DB
var DBPassword string

func InitDB() {
	dbPassword := os.Getenv("DB_PASSWORD")
	encryptedPassword := os.Getenv("DB_PASSWORD_ENCRYPTED")
	if encryptedPassword != "" {
		decrypted, err := utils.DecryptAES(encryptedPassword, os.Getenv("JWT_SECRET"))
		if err == nil {
			dbPassword = decrypted
		} else {
			log.Printf("Warning: failed to decrypt DB_PASSWORD_ENCRYPTED: %v", err)
		}
	}
	DBPassword = dbPassword

	dbSchema := os.Getenv("DB_SCHEMA")
	if dbSchema == "" {
		dbSchema = "public"
	}

	searchPath := dbSchema
	if dbSchema != "public" {
		searchPath = fmt.Sprintf("%s,public", dbSchema)
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s search_path=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		dbPassword,
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
		searchPath,
	)

	var err error
	
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Initialize chatbot database connection
	chatbotHost := os.Getenv("CHATBOT_DB_HOST")
	chatbotPort := os.Getenv("CHATBOT_DB_PORT")
	chatbotUser := os.Getenv("CHATBOT_DB_USER")
	chatbotName := os.Getenv("CHATBOT_DB_NAME")
	chatbotSchema := os.Getenv("CHATBOT_DB_SCHEMA")
	chatbotSSLMode := os.Getenv("CHATBOT_DB_SSLMODE")
	chatbotPassword := os.Getenv("CHATBOT_DB_PASSWORD")
	encryptedChatbotPassword := os.Getenv("CHATBOT_DB_PASSWORD_ENCRYPTED")

	if encryptedChatbotPassword != "" {
		decrypted, err := utils.DecryptAES(encryptedChatbotPassword, os.Getenv("JWT_SECRET"))
		if err == nil {
			chatbotPassword = decrypted
		} else {
			log.Printf("Warning: failed to decrypt CHATBOT_DB_PASSWORD_ENCRYPTED: %v", err)
		}
	}
	if chatbotPassword == "" {
		chatbotPassword = dbPassword
	}

	if chatbotHost != "" && chatbotName != "" {
		if chatbotSchema == "" {
			chatbotSchema = "chat_sch"
		}
		searchPathChat := chatbotSchema
		if chatbotSchema != "public" {
			searchPathChat = fmt.Sprintf("%s,public", chatbotSchema)
		}

		dsnChat := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s search_path=%s",
			chatbotHost,
			chatbotUser,
			chatbotPassword,
			chatbotName,
			chatbotPort,
			chatbotSSLMode,
			searchPathChat,
		)

		ChatBotDB, err = gorm.Open(postgres.Open(dsnChat), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Error),
			DisableForeignKeyConstraintWhenMigrating: true,
		})
		if err != nil {
			log.Printf("Warning: Failed to connect to chatbot database: %v. Falling back ChatBotDB to DB\n", err)
			ChatBotDB = DB
		} else {
			sqlChatDB, err := ChatBotDB.DB()
			if err == nil {
				sqlChatDB.SetMaxIdleConns(5)
				sqlChatDB.SetMaxOpenConns(50)
				sqlChatDB.SetConnMaxLifetime(10 * time.Minute)
			}
			fmt.Printf("ChatBot database connection established: %s (Schema: %s)\n", chatbotName, chatbotSchema)
		}
	} else {
		log.Println("CHATBOT_DB env not configured fully. Falling back ChatBotDB to LIMS DB")
		ChatBotDB = DB
	}

	// Optimize Connection Pool
	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)                  // Keep 10 idle connections
		sqlDB.SetMaxOpenConns(100)                 // Max 100 open connections
		sqlDB.SetConnMaxLifetime(10 * time.Minute) // Recycle connections after 10 mins
	}

	fmt.Printf("Database connection established: %s (Schema: %s)\n", os.Getenv("DB_NAME"), dbSchema)



	// Refresh global parameter cache in models
	models.RefreshParamCache(DB)
	models.RefreshRoleMenuCache(DB)

	// Initialize log paths in utils
	// Priority: 1. ENV, 2. Database, 3. Default (logs/...)
	apiPath := os.Getenv("API_LOG_PATH")
	if apiPath == "" {
		apiPath = models.GetGlobalParam("API_LOG_PATH", "logs/api_traffic.log")
	}
	
	dbLogPathFinal := os.Getenv("DB_LOG_PATH")
	if dbLogPathFinal == "" {
		dbLogPathFinal = models.GetGlobalParam("DB_LOG_PATH", "logs/db_query.log")
	}
	
	errLogPath := os.Getenv("ERROR_LOG_PATH")
	if errLogPath == "" {
		errLogPath = models.GetGlobalParam("ERROR_LOG_PATH", "logs/error.log")
	}
	
	utils.SetLogPaths(apiPath, dbLogPathFinal, errLogPath)

	// Re-initialize GORM logger with the final paths from database
	logWriter := utils.GetDBLogWriter()
	logLevel := logger.Error

	// Check TRACE_LEVEL to auto-enable SQL debug if in detailed mode
	traceLevel := os.Getenv("TRACE_LEVEL")
	if traceLevel == "" {
		traceLevel = models.GetGlobalParam("TRACE_LEVEL", "3")
	}

	dbDebug := os.Getenv("DB_DEBUG")
	if traceLevel == "3" || dbDebug == "true" || dbDebug == "1" {
		logLevel = logger.Info
	} else if dbDebug == "false" || dbDebug == "0" || dbDebug == "silent" || dbDebug == "off" {
		logLevel = logger.Silent
	}

	DB.Logger = logger.New(
		log.New(logWriter, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logLevel,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)
}

// GetGlobalParam is a proxy to models.GetGlobalParam
func GetGlobalParam(key string, defaultValue string) string {
	return models.GetGlobalParam(key, defaultValue)
}
