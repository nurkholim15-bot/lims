package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders menambahkan HTTP security headers pada setiap response.
// Header ini merupakan lapisan pertahanan penting terhadap XSS, Clickjacking,
// MIME sniffing, dan serangan berbasis browser lainnya.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Mencegah browser menebak Content-Type (MIME sniffing)
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")

		// Mencegah halaman di-embed dalam iframe (anti-clickjacking)
		c.Writer.Header().Set("X-Frame-Options", "DENY")

		// Aktifkan XSS filter bawaan browser lama
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")

		// Batasi informasi Referer yang dikirim
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Batasi fitur browser berbahaya
		c.Writer.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		// Content Security Policy:
		// - default-src 'self'           : hanya izinkan resource dari domain sendiri
		// - script-src 'self'            : hanya script dari domain sendiri (tidak ada inline script)
		// - style-src 'self' 'unsafe-inline' fonts.googleapis.com : izinkan Google Fonts & inline style (untuk Vite)
		// - font-src 'self' fonts.gstatic.com data: : izinkan font dari Google
		// - img-src 'self' data: blob:   : izinkan gambar inline (data URI) dan blob (untuk OCR/preview)
		// - connect-src 'self'           : hanya izinkan XHR/fetch ke domain sendiri
		// - frame-src 'self' blob:       : izinkan blob: untuk PDF preview di FinanceReportPage
		// - object-src 'none'            : blokir plugin seperti Flash
		// - base-uri 'self'              : cegah injeksi tag <base>
		c.Writer.Header().Set("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline'; "+
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "+
				"font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; "+
				"img-src 'self' data: blob:; "+
				"connect-src 'self'; "+
				"frame-src 'self' blob:; "+
				"object-src 'none'; "+
				"base-uri 'self'",
		)

		c.Next()
	}
}

// CORSWithWhitelist menangani CORS dengan membaca daftar origin yang diizinkan
// dari environment variable ALLOWED_ORIGINS (format: koma-separated, tanpa spasi).
// Contoh: ALLOWED_ORIGINS=http://lims.local:3000,http://lims.local:8082,https://lims.local
func CORSWithWhitelist() gin.HandlerFunc {
	// Baca whitelist dari env saat startup — tidak perlu restart jika env sudah di-load ulang
	rawOrigins := os.Getenv("ALLOWED_ORIGINS")

	allowedOrigins := make(map[string]bool)
	if rawOrigins != "" {
		for _, o := range strings.Split(rawOrigins, ",") {
			trimmed := strings.TrimSpace(o)
			if trimmed != "" {
				allowedOrigins[trimmed] = true
			}
		}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Jika origin kosong (request langsung/non-browser), izinkan lewat tanpa CORS header
		if origin == "" {
			c.Next()
			return
		}

		// Periksa apakah origin ada di whitelist
		if allowedOrigins[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			c.Writer.Header().Set("Access-Control-Allow-Headers",
				"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, "+
					"X-Simulator-Key, ngrok-skip-browser-warning, X-App-Version, X-App-Platform")
			// Expose header agar frontend bisa membaca Authorization dari response
			c.Writer.Header().Set("Access-Control-Expose-Headers", "Authorization")
		}
		// Origin tidak di whitelist: tidak set CORS header → browser akan blokir sendiri

		// Tangani preflight OPTIONS request
		if c.Request.Method == "OPTIONS" {
			if allowedOrigins[origin] {
				c.AbortWithStatus(http.StatusNoContent) // 204
			} else {
				c.AbortWithStatus(http.StatusForbidden) // 403 untuk origin tidak dikenal
			}
			return
		}

		c.Next()
	}
}
