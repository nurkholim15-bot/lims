package middleware

import (
	"bytes"
	"fmt"
	"io"
	"lim-system/utils"
	"lim-system/database"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r responseBodyWriter) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

func TransactionLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Priority: 1. ENV, 2. Database, 3. Default (3)
		traceLevel := os.Getenv("TRACE_LEVEL")
		if traceLevel == "" {
			traceLevel = database.GetGlobalParam("TRACE_LEVEL", "3")
		}

		// Disable logging if Level 0 or OFF
		if traceLevel == "0" || traceLevel == "OFF" || traceLevel == "off" {
			c.Next()
			return
		}

		start := time.Now()

		// Filter: Only log /api/ endpoints
		if !strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.Next()
			return
		}

		// Read Request Body (Needed for Level 1, 2, and 3)
		var requestBody []byte
		if c.Request.Body != nil && (traceLevel == "1" || traceLevel == "2" || traceLevel == "3") {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Capture Response Body (Needed for Level 1 and 3)
		var w *responseBodyWriter
		if traceLevel == "1" || traceLevel == "3" {
			w = &responseBodyWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
			c.Writer = w
		}

		ip := strings.TrimPrefix(c.ClientIP(), "::ffff:")
		method := c.Request.Method
		path := c.Request.URL.Path

		userID := "GUEST"
		if uname, exists := c.Get("username"); exists {
			userID = uname.(string)
		} else if uid, exists := c.Get("user_id"); exists {
			userID = fmt.Sprintf("%v", uid)
		}

		// Continue with the request chain
		fmt.Printf("[API] Incoming: %s %s from %s (User: %v)\n", method, path, ip, userID)
		c.Next()

		// --- POST-PROCESS LOGGING ---
		end := time.Now()
		latency := end.Sub(start)

		status := "Success"
		if c.Writer.Status() >= 400 {
			status = "Failed"
		}


		reqBodyStr := string(requestBody)
		resBodyStr := ""
		if w != nil {
			resBodyStr = w.body.String()
		}

		utils.LogAPITraffic(start, traceLevel, method, path, ip, userID, status, latency, reqBodyStr, resBodyStr)
	}
}
