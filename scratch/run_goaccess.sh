#!/bin/bash

echo "Menghentikan proses GoAccess yang lama (jika ada)..."
sudo killall goaccess 2>/dev/null || true

echo "Menjalankan GoAccess Baru di Latar Belakang..."
# --ws-url=wss://lims.local/ws digunakan agar WebSocket menggunakan koneksi aman (WSS) lewat Nginx
sudo goaccess /var/log/nginx/lims_access.log \
  --log-format='%h - ClientIP: %^ - [%d:%t %^] "%r" %s %b to_server=%v status=%^ resp_time=%^ agent="%u"' \
  --date-format='%d/%b/%Y' \
  --time-format='%H:%M:%S' \
  --ws-url=wss://lims.local/ws \
  -o /var/www/lims/frontend/dist/report.html \
  --real-time-html &

echo "GoAccess Berhasil dijalankan!"
