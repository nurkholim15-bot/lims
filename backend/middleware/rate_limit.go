package middleware

import (
	"lim-system/database"
	"lim-system/models"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type client struct {
	lastSeen time.Time
	count    int
}

var (
	clients = make(map[string]*client)
	mu      sync.Mutex
	once    sync.Once
)

func initCleanup() {
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, c := range clients {
				if time.Since(c.lastSeen) > time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

func RateLimiter(paramKey string, defaultLimit int) gin.HandlerFunc {
	// Initialize cleanup once
	once.Do(initCleanup)

	return func(c *gin.Context) {
		// Fetch limit from Global Parameters
		limitStr := models.GetGlobalParam(paramKey, "")
		limit := defaultLimit
		if limitStr != "" {
			if val, err := strconv.Atoi(limitStr); err == nil {
				limit = val
			}
		}

		// LOGIKA PENGECUALIAN RATE LIMIT UNTUK METODE GET:
		// Hanya kurangi kuota limit jika:
		// 1. Method bukan GET (seperti POST, PUT, DELETE)
		// 2. ATAU Method GET tapi mengakses endpoint berat (contoh: /applications, /assets, /reports)
		isHeavyGet := false
		if c.Request.Method == "GET" {
			path := c.Request.URL.Path
			// Mengambil daftar endpoint berat dari tabel global parameters (atau fallback ke default)
			heavyEndpointsParam := models.GetGlobalParam("RATE_LIMIT_HEAVY_ENDPOINTS", "/api/applications,/api/reports,/api/assets,/api/users")
			
			// Pecah berdasarkan koma, dan bersihkan spasi tambahan
			rawEndpoints := strings.Split(heavyEndpointsParam, ",")
			var heavyEndpoints []string
			for _, ep := range rawEndpoints {
				cleanEp := strings.TrimSpace(ep)
				if cleanEp != "" {
					heavyEndpoints = append(heavyEndpoints, cleanEp)
				}
			}
			for _, endpoint := range heavyEndpoints {
				if strings.HasPrefix(path, endpoint) {
					isHeavyGet = true
					break
				}
			}
			
			// Jika GET dan BUKAN endpoint berat (contoh: /config, /menus, master data), lewatkan tanpa mengurangi kuota
			if !isHeavyGet {
				c.Next()
				return
			}
		}

		ip := c.ClientIP()
		mu.Lock()
		
		if _, found := clients[ip]; !found {
			clients[ip] = &client{lastSeen: time.Now(), count: 0}
		}

		// Reset count if last seen was more than a minute ago
		if time.Since(clients[ip].lastSeen) > time.Minute {
			clients[ip].count = 0
		}

		clients[ip].lastSeen = time.Now()
		clients[ip].count++
		
		currentCount := clients[ip].count
		mu.Unlock()

		if currentCount > limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Terlalu banyak permintaan. Silakan coba lagi dalam satu menit.",
			})
			c.Abort()
			return
		}

		c.Next()

		// ASYNCHRONOUS LOGGING: Rekam aktivitas user jika lolos rate limit
		// Cek flag agar tidak tercatat ganda jika ada 2 RateLimiter bertumpuk
		if _, logged := c.Get("activity_logged"); logged {
			return
		}
		c.Set("activity_logged", true)

		// Eksekusi ini dilakukan setelah request selesai agar tidak memblokir respon ke UI
		if userIDVal, exists := c.Get("user_id"); exists {
			method := c.Request.Method
			path := c.Request.URL.Path
			
			// Tambahkan detail khusus untuk membedakan menu Pendaftaran/Verifikasi/Pengujian/Pencarian
			if strings.HasPrefix(path, "/api/applications") && method == "GET" {
				statusFilter := c.Query("status")
				if statusFilter != "" {
					path = path + " [status:" + statusFilter + "]"
				} else {
					path = path + " [pencarian_all]"
				}
			} else if method != "GET" {
				// Untuk aksi ubah data, sertakan method-nya (contoh: POST /api/applications)
				path = method + " " + path
				// Tambahkan custom status jika dikirim oleh Controller (solusi Nomor 2)
				if customStatus, exists := c.Get("activity_status"); exists {
					path = path + " [status:" + customStatus.(string) + "]"
				}
			}

			clientIP := c.ClientIP()
			// Mencegah pencatatan path yang terlalu panjang jika ada error
			if len(path) > 100 {
				path = path[:97] + "..."
			}

			// Jalankan secara asynchronous
			go func(uID uint, act string, proc string, userIP string) {
				logEntry := models.UserActivityLog{
					UserID:    uID,
					Process:   proc,
					Activity:  act,
					IPAddress: userIP,
				}
				// GORM akan otomatis melakukan routing ke partisi bulanan (misal: user_activity_logs_202606)
				database.DB.Create(&logEntry)
			}(userIDVal.(uint), path, method, clientIP)
		}
	}
}
