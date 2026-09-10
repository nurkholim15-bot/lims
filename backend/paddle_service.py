import sys
import os
import json
import logging
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Suppress verbose C++ logs from Paddle
os.environ["GLOG_minloglevel"] = "2"
os.environ["PPOCR_LOG_LEVEL"] = "ERROR"
logging.getLogger("ppocr").setLevel(logging.ERROR)

# Import PaddleOCR and existing module
try:
    from paddleocr import PaddleOCR
    import paddle_ocr
except ImportError as e:
    print(f"[LIMS OCR Daemon] Fatal Error importing PaddleOCR: {e}", file=sys.stderr)
    sys.exit(1)

HOST = os.environ.get("OCR_DAEMON_HOST", "127.0.0.1")
PORT = int(os.environ.get("OCR_DAEMON_PORT", 8089))

print(f"[LIMS OCR Daemon] Initializing PaddleOCR model in memory (Standby Mode)...")
try:
    ocr_engine = PaddleOCR(use_textline_orientation=False, lang='id', enable_mkldnn=False)
    print(f"[LIMS OCR Daemon] PaddleOCR model successfully loaded into RAM!")
except Exception as e:
    print(f"[LIMS OCR Daemon] Failed to initialize PaddleOCR model: {e}", file=sys.stderr)
    sys.exit(1)

class OCRDaemonHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean logging format
        print(f"[LIMS OCR Daemon] {self.address_string()} - {format % args}")

    def do_GET(self):
        if self.path in ("/health", "/", "/status"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "status": "healthy",
                "service": "LIMS PaddleOCR Standby Daemon",
                "ready": True,
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/ocr":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Empty request body"}).encode("utf-8"))
                return

            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON body: {e}"}).encode("utf-8"))
                return

            image_path = data.get("image_path", "")
            if not image_path or not os.path.exists(image_path):
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Image file not found: {image_path}"}).encode("utf-8"))
                return

            code_min = float(data.get("code_min", 0.12))
            code_max = float(data.get("code_max", 0.28))
            skor_min = float(data.get("skor_min", 0.70))
            skor_max = float(data.get("skor_max", 0.98))
            filter_cols = data.get("filter_cols", True)

            try:
                # Process with memory-resident OCR model instance
                output_text = paddle_ocr.process_image(
                    image_path,
                    code_min=code_min,
                    code_max=code_max,
                    skor_min=skor_min,
                    skor_max=skor_max,
                    filter_cols=filter_cols,
                    ocr_instance=ocr_engine
                )
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": 200, "text": output_text}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    server = ThreadingHTTPServer((HOST, PORT), OCRDaemonHandler)
    print(f"[LIMS OCR Daemon] Listening on http://{HOST}:{PORT}/ocr (Standby in RAM)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[LIMS OCR Daemon] Stopping server...")
        server.shutdown()

if __name__ == "__main__":
    run_server()
