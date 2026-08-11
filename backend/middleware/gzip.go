package middleware

import (
	"compress/gzip"
	"strings"

	"github.com/gin-gonic/gin"
)

type gzipWriter struct {
	gin.ResponseWriter
	writer *gzip.Writer
}

func (g *gzipWriter) Write(data []byte) (int, error) {
	return g.writer.Write(data)
}

func (g *gzipWriter) WriteString(s string) (int, error) {
	return g.writer.Write([]byte(s))
}

func (g *gzipWriter) WriteHeader(code int) {
	g.Header().Del("Content-Length")
	g.ResponseWriter.WriteHeader(code)
}

// GzipMiddleware mengompresi response HTTP menggunakan Gzip jika client mendukungnya (Accept-Encoding: gzip).
func GzipMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !strings.Contains(c.GetHeader("Accept-Encoding"), "gzip") {
			c.Next()
			return
		}

		// Jangan kompresi koneksi WebSocket atau jika Content-Encoding sudah diset oleh upstream
		if c.GetHeader("Upgrade") == "websocket" || c.Writer.Header().Get("Content-Encoding") != "" {
			c.Next()
			return
		}

		gz, err := gzip.NewWriterLevel(c.Writer, gzip.DefaultCompression)
		if err != nil {
			c.Next()
			return
		}

		c.Header("Content-Encoding", "gzip")
		c.Header("Vary", "Accept-Encoding")

		gWriter := &gzipWriter{ResponseWriter: c.Writer, writer: gz}
		c.Writer = gWriter

		defer func() {
			gz.Close()
			c.Header("Content-Length", "")
		}()

		c.Next()
	}
}
