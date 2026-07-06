package routes

import (
	"lim-system/controllers"
	"lim-system/middleware"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Security Headers — wajib dipasang sebelum semua middleware lain
	r.Use(middleware.SecurityHeaders())

	// CORS — hanya izinkan origin yang terdaftar di ALLOWED_ORIGINS (.env)
	r.Use(middleware.CORSWithWhitelist())

	r.Use(middleware.TransactionLogger())


	// Serve uploads
	r.Static("/uploads", "./public/uploads")

	// Routes
	api := r.Group("/api")
	api.Use(middleware.VersionCheckMiddleware())
	api.Use(middleware.RateLimiter("RATE_LIMIT_GENERAL_RPM", 500)) // General rate limit: 500 rpm
	{
		// Public Routes (Minimal)
		api.POST("/login", middleware.RateLimiter("RATE_LIMIT_LOGIN_RPM", 10), controllers.Login) // Strict for login: 10 rpm
		api.POST("/change-expired-password", middleware.RateLimiter("RATE_LIMIT_LOGIN_RPM", 10), controllers.ChangeExpiredPassword)
		api.GET("/check-password-expiry", middleware.RateLimiter("RATE_LIMIT_LOGIN_RPM", 20), controllers.CheckPasswordExpiry)
		api.GET("/check-version", middleware.RateLimiter("RATE_LIMIT_LOGIN_RPM", 20), controllers.CheckAppVersion)

		// IoT / Hardware Integration Webhook (Uses X-Simulator-Key validation in controller)
		api.POST("/machine-integration/results", controllers.ReceiveMachineResult)

		// Telegram Bot Webhook
		api.POST("/webhook/telegram", controllers.TelegramWebhookHandler)

		// Protected Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Config & Downloads (Now protected)
			protected.GET("/config", controllers.GetConfig)
			protected.GET("/download", controllers.DownloadDocument)

			protected.GET("/menus", controllers.GetSidebarMenus)
			protected.GET("/master-data", controllers.GetMasterData)
			protected.GET("/dashboard-stats", controllers.GetDashboardStats)
			protected.POST("/logout", controllers.Logout)
			protected.POST("/verify-password", controllers.VerifyPassword)
			protected.POST("/ocr-extract", controllers.OCRExtract)
			protected.POST("/ocr-extract-results", controllers.OCRExtractTestResults)
			protected.POST("/applications/:id/generate-report", controllers.GenerateReport)

			// SOP / RAG Routes
			protected.GET("/sop", controllers.ListSOPs)
			protected.POST("/chat", controllers.RAGChatQuery)
			protected.POST("/sop/upload", controllers.UploadSOP)
			protected.DELETE("/sop/:id", controllers.DeleteSOP)

			// Agent Chat Routes
			protected.POST("/agent-chat/send", controllers.SendAgentChatMessage)
			protected.GET("/agent-chat/history", controllers.GetAgentChatHistory)
			protected.GET("/agent-chat/sessions", controllers.GetActiveChatSessions)

			protected.GET("/applications", controllers.GetApplications)
			protected.GET("/applications/:id", controllers.GetApplication)
			protected.GET("/applications/search-reg", controllers.SearchApplicationByReg)
			protected.GET("/applications/:id/execution", controllers.GetExecution)
			protected.GET("/applications/:id/audit-history", controllers.GetApplicationAuditHistory)

			// Reports
			protected.GET("/reports/summary", controllers.GetSummaryReport)
			protected.GET("/reports/detail", controllers.GetDetailReport)
			protected.GET("/reports/finance", controllers.GetMonthlyFinanceReport)
			protected.GET("/reports/tool-transactions", controllers.GetToolTransactionReport)
			protected.GET("/reports/asset-list", controllers.GetAssetListReport)
			protected.GET("/reports/asset-handover", controllers.GetAssetHandoverReport)
			protected.GET("/reports/analytics-report", controllers.GetGoAccessReport)
			protected.GET("/auth/check-report-access", controllers.CheckReportAccess)

			// Hierarchical Scoring (v2.0)
			protected.GET("/applications/:id/scoring-breakdown", controllers.GetApplicationScoringBreakdown)
			protected.GET("/scoring/aspects", controllers.GetScoringAspects)
			protected.POST("/applications/:id/validate-scoring", controllers.ValidateApplicationScoring)

			protected.POST("/applications", controllers.CreateApplication)
			protected.PUT("/applications/:id", controllers.UpdateApplication)
			protected.PUT("/applications/:id/verify", controllers.VerifyApplication)
			protected.PUT("/applications/:id/approve", controllers.ApproveApplication)
			protected.PUT("/applications/:id/plan", controllers.PlanApplication)
			protected.PUT("/applications/:id/execute", controllers.ExecuteApplication)
			protected.PUT("/applications/:id/execute-aspect/:aspect_code", controllers.SaveAspectResults)
			protected.PUT("/applications/:id/analyze", controllers.AnalyzeApplication)
			protected.PUT("/applications/:id/revision", controllers.RevisionApplication)

			protected.PUT("/applications/:id/finalize", controllers.FinalizeApplication)
			protected.PUT("/applications/:id/cancel", controllers.CancelApplication)

			// Simulator / IoT Data Logs
			protected.GET("/simulator-logs", controllers.GetSimulatorLogs)

			// Common Master Data
			protected.GET("/roles", controllers.GetRoles)
			protected.GET("/roles/:id", controllers.GetRole)
			protected.GET("/hist-roles", controllers.GetHistRoles)
			protected.GET("/hist-role-menus", controllers.GetHistRoleMenus)
			protected.GET("/all-menus", controllers.GetMenus)
			protected.GET("/hist-menus", controllers.GetHistMenus)
			protected.GET("/users", controllers.GetUsers)
			protected.GET("/users/:id", controllers.GetUser)
			protected.GET("/hist-users", controllers.GetHistUsers)
			protected.GET("/user-sessions", controllers.GetUserSessions)
			protected.GET("/partners", controllers.GetPartners)
			protected.GET("/hist-partners", controllers.GetHistPartners)
			protected.GET("/material-categories", controllers.GetMaterialCategories)
			protected.GET("/hist-material-categories", controllers.GetHistMaterialCategories)

			protected.GET("/origins", controllers.GetOrigins)
			protected.GET("/hist-origins", controllers.GetHistOrigins)
			protected.GET("/brands", controllers.GetBrands)
			protected.GET("/hist-brands", controllers.GetHistBrands)
			protected.GET("/models", controllers.GetModels)
			protected.GET("/hist-models", controllers.GetHistModels)
			protected.GET("/variants", controllers.GetVariants)
			protected.GET("/test-types", controllers.GetTestTypes)
			protected.GET("/hist-test-types", controllers.GetHistTestTypes)
			protected.GET("/locations", controllers.GetLocations)
			protected.GET("/hist-locations", controllers.GetHistLocations)
			protected.GET("/methodologies", controllers.GetMethodologies)
			protected.GET("/scoring-aspects", controllers.GetScoringAspects)
			protected.GET("/hist-scoring-aspects", controllers.GetHistScoringAspects)
			protected.GET("/scoring-sub-aspects", controllers.GetScoringSubAspects)
			protected.GET("/hist-scoring-sub-aspects", controllers.GetHistScoringSubAspects)
			protected.GET("/scoring-sub-aspect-items", controllers.GetScoringSubAspectItems)
			protected.GET("/hist-scoring-sub-aspect-items", controllers.GetHistScoringSubAspectItems)
			protected.GET("/scoring-levels", controllers.GetScoringLevels)
			protected.GET("/hist-scoring-levels", controllers.GetHistScoringLevels)
			protected.GET("/tester-masters", controllers.GetMasterTesters)
			protected.GET("/tester-masters/:id", controllers.GetMasterTester)
			protected.GET("/partner-types", controllers.GetPartnerTypes)
			protected.GET("/hist-partner-types", controllers.GetHistPartnerTypes)
			protected.GET("/provinces", controllers.GetProvinces)
			protected.GET("/hist-provinces", controllers.GetHistProvinces)
			protected.GET("/cities", controllers.GetCities)
			protected.GET("/hist-cities", controllers.GetHistCities)
			protected.GET("/global-parameters", controllers.GetGlobalParametersCRUD)
			protected.GET("/hist-global-parameters", controllers.GetHistGlobalParameters)
			protected.GET("/testing-packages", controllers.GetTestingPackages)
			protected.GET("/hist-testing-packages", controllers.GetHistTestingPackages)
			protected.GET("/hist-package-active-aspects", controllers.GetHistPackageActiveAspects)
			protected.GET("/hist-package-active-sub-aspects", controllers.GetHistPackageActiveSubAspects)
			protected.GET("/hist-master-testers", controllers.GetHistMasterTesters)
			protected.GET("/hist-asset-statuses", controllers.GetHistAssetStatuses)
			protected.GET("/testing-tools", controllers.GetTestingTools)
			protected.GET("/hist-testing-tools", controllers.GetHistTestingTools)
			protected.GET("/hist-methodologies", controllers.GetHistMethodologies)
			protected.GET("/hist-variants", controllers.GetHistVariants)
			protected.GET("/status-applications", controllers.GetStatusApplications)
			protected.GET("/hist-status-applications", controllers.GetHistStatusApplications)
			protected.GET("/testing-tools/availability", controllers.GetToolAvailability)
			protected.POST("/testing-tools/reserve", controllers.ReserveTool)
			
			// Billing Routes
			protected.GET("/invoices", controllers.GetInvoices)
			protected.GET("/payments", controllers.GetPayments)
			protected.POST("/invoices/generate/:appId", controllers.GenerateInvoice)
			protected.POST("/payments", controllers.CreatePayment)

			// Asset Tracking Routes
			protected.GET("/assets", controllers.GetAssets)
			protected.POST("/asset-activity", controllers.LogAssetActivity)
			protected.GET("/asset-statuses", controllers.GetAssetStatuses)
			protected.GET("/asset-logs", controllers.GetAssetLogs)
			protected.GET("/asset-handover/:id", controllers.GetAssetHandover)
			protected.POST("/management/asset-statuses", controllers.CreateAssetStatus)
			protected.PUT("/management/asset-statuses/:id", controllers.UpdateAssetStatus)
			protected.DELETE("/management/asset-statuses/:id", controllers.DeleteAssetStatus)

			// Travel Request (SPD) Routes
			protected.GET("/travel-requests", controllers.GetTravelRequests)
			protected.POST("/travel-requests", controllers.CreateTravelRequest)
			protected.PUT("/travel-requests/:id", controllers.UpdateTravelRequest)
			protected.PUT("/travel-requests/:id/approve", controllers.ApproveTravelRequest)

			// Cash Advances
			protected.GET("/cash-advances", controllers.GetCashAdvances)
			protected.POST("/cash-advances", controllers.CreateCashAdvance)
			protected.PUT("/cash-advances/:id/approve", controllers.ApproveCashAdvance)

			// Reimbursement Routes
			protected.GET("/reimbursements", controllers.GetReimbursements)
			protected.POST("/reimbursements", controllers.CreateReimbursement)
			protected.PUT("/reimbursements/:id/approve", controllers.ApproveReimbursement)

			// Admin & Management CRUD
			// Partner management is now accessible to non-admins
			protected.POST("/management/partners", controllers.CreatePartner)
			protected.PUT("/management/partners/:id", controllers.UpdatePartner)
			protected.DELETE("/management/partners/:id", controllers.DeletePartner)

			protected.POST("/management/partner-types", controllers.CreatePartnerType)
			protected.PUT("/management/partner-types/:id", controllers.UpdatePartnerType)
			protected.DELETE("/management/partner-types/:id", controllers.DeletePartnerType)


			mgmt := protected.Group("/management")
			mgmt.Use(middleware.RoleCheck("ADMIN"))
			{
				mgmt.POST("/roles", controllers.CreateRole)
				mgmt.PUT("/roles/:id", controllers.UpdateRole)
				mgmt.DELETE("/roles/:id", controllers.DeleteRole)
				mgmt.POST("/roles/:id/menus", controllers.AssignMenusToRole)

				mgmt.POST("/menus", controllers.CreateMenu)
				mgmt.PUT("/menus/:id", controllers.UpdateMenu)
				mgmt.DELETE("/menus/:id", controllers.DeleteMenu)

				mgmt.POST("/users", controllers.CreateUser)
				mgmt.PUT("/users/:id", controllers.UpdateUser)
				mgmt.DELETE("/users/:id", controllers.DeleteUser)

				mgmt.POST("/user-sessions", controllers.CreateUserSession)
				mgmt.PUT("/user-sessions/:id", controllers.UpdateUserSession)
				mgmt.DELETE("/user-sessions/:id", controllers.DeleteUserSession)
				mgmt.POST("/user-sessions/cleanup/expired", controllers.CleanupExpiredSessions)

				mgmt.POST("/material-categories", controllers.CreateMaterialCategory)
				mgmt.PUT("/material-categories/:id", controllers.UpdateMaterialCategory)
				mgmt.DELETE("/material-categories/:id", controllers.DeleteMaterialCategory)




				mgmt.POST("/origins", controllers.CreateOrigin)
				mgmt.PUT("/origins/:id", controllers.UpdateOrigin)
				mgmt.DELETE("/origins/:id", controllers.DeleteOrigin)

				mgmt.POST("/brands", controllers.CreateBrand)
				mgmt.PUT("/brands/:id", controllers.UpdateBrand)
				mgmt.DELETE("/brands/:id", controllers.DeleteBrand)

				mgmt.POST("/models", controllers.CreateModel)
				mgmt.PUT("/models/:id", controllers.UpdateModel)
				mgmt.DELETE("/models/:id", controllers.DeleteModel)

				mgmt.POST("/variants", controllers.CreateVariant)
				mgmt.PUT("/variants/:id", controllers.UpdateVariant)
				mgmt.DELETE("/variants/:id", controllers.DeleteVariant)

				mgmt.POST("/test-types", controllers.CreateTestType)
				mgmt.PUT("/test-types/:id", controllers.UpdateTestType)
				mgmt.DELETE("/test-types/:id", controllers.DeleteTestType)

				mgmt.POST("/locations", controllers.CreateLocation)
				mgmt.PUT("/locations/:id", controllers.UpdateLocation)
				mgmt.DELETE("/locations/:id", controllers.DeleteLocation)

				mgmt.POST("/methodologies", controllers.CreateMethodology)
				mgmt.PUT("/methodologies/:id", controllers.UpdateMethodology)
				mgmt.DELETE("/methodologies/:id", controllers.DeleteMethodology)

				mgmt.POST("/scoring-levels", controllers.CreateScoringLevel)
				mgmt.PUT("/scoring-levels/:id", controllers.UpdateScoringLevel)
				mgmt.DELETE("/scoring-levels/:id", controllers.DeleteScoringLevel)

				mgmt.POST("/global-parameters", controllers.CreateGlobalParameter)
				mgmt.PUT("/global-parameters/:id", controllers.UpdateGlobalParameter)
				mgmt.DELETE("/global-parameters/:id", controllers.DeleteGlobalParameter)

				mgmt.POST("/provinces", controllers.CreateProvince)
				mgmt.PUT("/provinces/:id", controllers.UpdateProvince)
				mgmt.DELETE("/provinces/:id", controllers.DeleteProvince)

				mgmt.POST("/cities", controllers.CreateCity)
				mgmt.PUT("/cities/:id", controllers.UpdateCity)
				mgmt.DELETE("/cities/:id", controllers.DeleteCity)

				mgmt.POST("/testing-tools", controllers.CreateTestingTool)
				mgmt.PUT("/testing-tools/:code", controllers.UpdateTestingTool)
				mgmt.DELETE("/testing-tools/:code", controllers.DeleteTestingTool)
				mgmt.POST("/testing-tools/stock-in", controllers.AddToolStock)
				mgmt.GET("/testing-tools/:code/transactions", controllers.GetToolTransactions)

				mgmt.POST("/scoring-aspects", controllers.CreateScoringAspect)
				mgmt.PUT("/scoring-aspects/:id", controllers.UpdateScoringAspect)
				mgmt.DELETE("/scoring-aspects/:id", controllers.DeleteScoringAspect)

				mgmt.POST("/scoring-sub-aspects", controllers.CreateScoringSubAspect)
				mgmt.PUT("/scoring-sub-aspects/:id", controllers.UpdateScoringSubAspect)
				mgmt.DELETE("/scoring-sub-aspects/:id", controllers.DeleteScoringSubAspect)

				mgmt.POST("/scoring-sub-aspect-items", controllers.CreateScoringSubAspectItem)
				mgmt.PUT("/scoring-sub-aspect-items/:id", controllers.UpdateScoringSubAspectItem)
				mgmt.DELETE("/scoring-sub-aspect-items/:id", controllers.DeleteScoringSubAspectItem)

				mgmt.POST("/status-applications", controllers.CreateStatusApplication)
				mgmt.PUT("/status-applications/:id", controllers.UpdateStatusApplication)
				mgmt.DELETE("/status-applications/:id", controllers.DeleteStatusApplication)

				mgmt.POST("/testing-packages", controllers.CreateTestingPackage)
				mgmt.PUT("/testing-packages/:id", controllers.UpdateTestingPackage)
				mgmt.DELETE("/testing-packages/:id", controllers.DeleteTestingPackage)

				mgmt.POST("/tester-masters", controllers.CreateMasterTester)
				mgmt.PUT("/tester-masters/:id", controllers.UpdateMasterTester)
				mgmt.DELETE("/tester-masters/:id", controllers.DeleteMasterTester)

				mgmt.GET("/db/eligible", controllers.GetEligiblePartitions)
				mgmt.POST("/db/archive", controllers.ArchiveData)
				mgmt.POST("/db/unarchive", controllers.UnarchiveData)
				mgmt.GET("/db/backup", controllers.BackupDatabase)
				mgmt.POST("/db/restore", controllers.RestoreDatabase)
				mgmt.GET("/db/analyze", controllers.AnalyzeDatabaseSchema)
				mgmt.POST("/db/sync", controllers.SyncDatabaseSchema)
				mgmt.GET("/db/bloat", controllers.GetDatabaseBloat)
				mgmt.POST("/db/vacuum", controllers.VacuumTable)
			}
		}
	}

	// frontend Handling
	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(404, gin.H{"error": "API route not found"})
			return
		}

		isDev := os.Getenv("GIN_MODE") != "release"
		if isDev {
			target := "http://localhost:5173"
			remote, _ := url.Parse(target)
			proxy := httputil.NewSingleHostReverseProxy(remote)
			proxy.Director = func(req *http.Request) {
				req.Header = c.Request.Header
				req.Host = remote.Host
				req.URL.Scheme = remote.Scheme
				req.URL.Host = remote.Host
				req.URL.Path = c.Request.URL.Path
			}
			proxy.ServeHTTP(c.Writer, c.Request)
			return
		}

		c.File("./frontend/dist/index.html")
	})

	isDev := os.Getenv("GIN_MODE") != "release"
	if !isDev {
		r.Static("/assets", "./frontend/dist/assets")
		r.StaticFile("/favicon.ico", "./frontend/dist/favicon.ico")
		r.StaticFile("/logo.png", "./frontend/dist/logo.png")

		r.GET("/", func(c *gin.Context) {
			c.File("./frontend/dist/index.html")
		})
	} else {
		r.GET("/", func(c *gin.Context) {
			url, _ := url.Parse("http://localhost:5173")
			proxy := httputil.NewSingleHostReverseProxy(url)
			proxy.ServeHTTP(c.Writer, c.Request)
		})
	}
}
