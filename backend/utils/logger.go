package utils

import (
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"
)

var (
	apiLogPath   = "logs/api_traffic.log"
	dbLogPath    = "logs/db_query.log"
	errorLogPath = "logs/error.log"
	logMutex     sync.Mutex
)

func SetLogPaths(apiPath, dbPath, errPath string) {
	logMutex.Lock()
	defer logMutex.Unlock()
	if apiPath != "" { apiLogPath = apiPath }
	if dbPath != "" { dbLogPath = dbPath }
	if errPath != "" { errorLogPath = errPath }
}

func GetDBLogWriter() io.Writer {
	dir := "logs"
	if lastSlash := strings.LastIndexAny(dbLogPath, "/\\"); lastSlash != -1 {
		dir = dbLogPath[:lastSlash]
	}
	os.MkdirAll(dir, 0755)

	f, _ := os.OpenFile(dbLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	// Return MultiWriter to log to both file and terminal
	return io.MultiWriter(os.Stdout, f)
}

func writeToLog(path, entry string) {
	logMutex.Lock()
	defer logMutex.Unlock()

	dir := "logs"
	if lastSlash := strings.LastIndexAny(path, "/\\"); lastSlash != -1 {
		dir = path[:lastSlash]
	}
	os.MkdirAll(dir, 0755)

	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening log file %s: %v\n", path, err)
		return
	}
	defer f.Close()
	f.WriteString(entry)
}

func LogError(ip string, user string, process string, details string, err error) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}
	logEntry := fmt.Sprintf("%s | %-15s | %-15s | %-25s | Error: %s | Details: %s\n",
		timestamp, ip, user, process, errMsg, details)
	writeToLog(errorLogPath, logEntry)
}

// LogAPITraffic saves API call details according to trace level
func LogAPITraffic(ts time.Time, level string, method string, path string, ip string, user string, status string, latency time.Duration, reqBody string, resBody string) {
	// Early exit if logging is disabled
	if level == "0" || level == "OFF" || level == "off" {
		return
	}

	timestamp := ts.Format("2006-01-02 15:04:05")
	duration := fmt.Sprintf("%v", latency.Round(time.Millisecond))
	
	// Default to LOW if level is invalid/empty
	if level == "" {
		level = "3"
	}

	var logEntry string
	switch level {
	case "3", "TRACE", "trace": // TRACE (User's Low Level): Full Detail (Request + Response)
		logEntry = fmt.Sprintf("[%s] %s | %s | %s | %s | Status: %s | Latency: %s\n      Request: %s\n      Response: %s\n", 
			timestamp, ip, user, method, path, status, duration, MaskSensitiveData(reqBody), MaskSensitiveData(resBody))
	case "2", "MED", "med", "MEDIUM", "medium": // MED: Summary + Request Body
		logEntry = fmt.Sprintf("[%s] %s | %s | %s | %s | Status: %s | Latency: %s\n      Request: %s\n", 
			timestamp, ip, user, method, path, status, duration, MaskSensitiveData(reqBody))
	case "1", "HIGH", "high": // HIGH (User's High Level): Summary Only
		logEntry = fmt.Sprintf("[%s] %s | %s | %s | %s | Status: %s | Latency: %s\n", 
			timestamp, ip, user, method, path, status, duration)
	default:
		// Default to summary for any other value
		logEntry = fmt.Sprintf("[%s] %s | %s | %s | %s | Status: %s | Latency: %s\n", 
			timestamp, ip, user, method, path, status, duration)
	}
	
	// Console output for direct visibility
	fmt.Print(logEntry)

	writeToLog(apiLogPath, logEntry)
}
