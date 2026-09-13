#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$DIR/simulator.log"

status() {
    PID=$(pgrep -f "python3.*scpi_simulator.py" | head -n 1)
    if [ -n "$PID" ]; then
        echo "=================================================="
        echo "  STATUS SCPI SIMULATOR: AKTIF (ONLINE)"
        echo "=================================================="
        echo "PID Process   : $PID"
        echo "Port Aktif    :"
        ss -tlpn | grep -E "5025|5026|5027" | awk '{print "  - " $4}'
        echo ""
        echo "Uji Respon Alat (SCPI *IDN?):"
        echo -n "  - Port 5025 (Oscilloscope)      : "
        RESP1=$(echo '*IDN?' | nc -w 1 127.0.0.1 5025 2>/dev/null | tr -d '\r\n')
        [ -n "$RESP1" ] && echo "$RESP1" || echo "Timeout/Offline"

        echo -n "  - Port 5026 (Spectrum Analyzer) : "
        RESP2=$(echo '*IDN?' | nc -w 1 127.0.0.1 5026 2>/dev/null | tr -d '\r\n')
        [ -n "$RESP2" ] && echo "$RESP2" || echo "Timeout/Offline"

        echo -n "  - Port 5027 (UTM 5 kN)          : "
        RESP3=$(echo '$GET_MACHINE_INFO' | nc -w 1 127.0.0.1 5027 2>/dev/null | tr -d '\r\n')
        [ -n "$RESP3" ] && echo "$RESP3" || echo "Timeout/Offline"
        echo "=================================================="
    else
        echo "=================================================="
        echo "  STATUS SCPI SIMULATOR: MATI (OFFLINE)"
        echo "=================================================="
        echo "Tidak ada proses scpi_simulator.py yang berjalan."
        echo "Jalankan: $0 start"
        echo "=================================================="
    fi
}

start() {
    PID=$(pgrep -f "python3.*scpi_simulator.py" | head -n 1)
    if [ -n "$PID" ]; then
        echo "⚠️ SCPI Simulator sudah aktif dengan PID: $PID"
        return
    fi
    echo "🚀 Memulai SCPI Simulator di latar belakang (daemon)..."
    nohup python3 "$DIR/scpi_simulator.py" > "$LOG_FILE" 2>&1 &
    sleep 1.5
    status
}

stop() {
    PIDS=$(pgrep -f "python3.*scpi_simulator.py")
    if [ -n "$PIDS" ]; then
        echo "🛑 Menghentikan proses SCPI Simulator (PID: $PIDS)..."
        kill $PIDS 2>/dev/null
        sleep 1
        PIDS_LEFT=$(pgrep -f "python3.*scpi_simulator.py")
        if [ -n "$PIDS_LEFT" ]; then
            kill -9 $PIDS_LEFT 2>/dev/null
        fi
        echo "✅ SCPI Simulator berhasil dihentikan."
    else
        echo "ℹ️ SCPI Simulator memang sedang tidak berjalan."
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    status)
        status
        ;;
    *)
        echo "Penggunaan: $0 {status|start|stop|restart}"
        exit 1
        ;;
esac
