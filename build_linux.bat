@echo off
echo ========================================================
echo Building LIMS Go Backend for Ubuntu (Linux) via WSL
echo ========================================================
wsl sh -c "cd /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend && ~/go-install/go/bin/go clean -cache && ~/go-install/go/bin/go build -o main main.go"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed! Please check WSL environment and Go installation.
    pause
    exit /b %ERRORLEVEL%
)
echo ========================================================
echo [SUCCESS] Build completed. Linux binary generated: backend/main
echo ========================================================
pause
