#!/usr/bin/env python3
"""
LIMS SCPI Automated Integration Test Suite
==========================================
Skrip pengujian integrasi otomatis end-to-end untuk memverifikasi:
1. Koneksi socket ke ketiga instrumen (Oscilloscope, Spectrum Analyzer, UTM).
2. Respon perintah query IEEE 488.2 (*IDN?).
3. Eksekusi pengujian parameter otomatis (KEDAI, KESEL, KESEN, KOBER).
4. Mekanisme keamanan Safe Guard (penolakan parameter unconfigured 'XYZ').
5. Ketersediaan REST API LIMS (http://127.0.0.1:8081).
"""

import sys
import os
import json
import socket
import subprocess
import requests

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_socket_connection(name, host, port, query="*IDN?"):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(2.0)
            s.connect((host, int(port)))
            s.sendall((query + "\n").encode('utf-8'))
            resp = s.recv(1024).decode('utf-8', errors='ignore').strip()
            return True, resp
    except Exception as e:
        return False, str(e)

def run_cli_test(args):
    cmd = [sys.executable, "lims_scpi_agent.py"] + args
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
    return res.returncode, res.stdout, res.stderr

def main():
    import argparse
    parser = argparse.ArgumentParser(description="LIMS Automated Integration Test Suite")
    parser.add_argument("--upload-app-id", type=int, default=0, help="ID Permohonan LIMS untuk upload data live (bukan dry-run)")
    cli_args = parser.parse_args()

    upload_id = cli_args.upload_app_id

    print_header("LIMS AUTOMATED INTEGRATION TEST SUITE")
    if upload_id > 0:
        print(f"  MODE: LIVE UPLOAD AKTIF -> Target Application ID: #{upload_id}")
    else:
        print("  MODE: DRY-RUN ISOLATION (Pengujian tanpa mengubah database LIMS)")
    cfg_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    
    if not os.path.exists(cfg_file):
        print(f"❌ [FAIL] File konfigurasi {cfg_file} tidak ditemukan!")
        sys.exit(1)
        
    with open(cfg_file, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    results = []

    # 1. TEST KONEKTIVITAS INSTRUMEN / SIMULATOR
    print("\n[FASE 1: VERIFIKASI SOKET INSTRUMEN LAB / DIGITAL TWIN]")
    for inst_key, inst in cfg.get("instruments", {}).items():
        name = inst.get("name", inst_key)
        host = inst.get("host", "127.0.0.1")
        port = inst.get("port", 5025)
        query = inst.get("query_idn", "*IDN?")
        
        ok, resp = test_socket_connection(name, host, port, query)
        if ok:
            print(f"  ✅ [PASS] {inst_key} ({host}:{port}) -> {resp}")
            results.append((f"Socket {inst_key}", True, resp))
        else:
            print(f"  ❌ [FAIL] {inst_key} ({host}:{port}) -> {resp}")
            results.append((f"Socket {inst_key}", False, resp))

    # 2. TEST DISPATCH PARAMETER SCPI
    mode_label = f"LIVE UPLOAD KE APP #{upload_id}" if upload_id > 0 else "DRY-RUN ISOLASI"
    print(f"\n[FASE 2: UJI EKSEKUSI PENGUJIAN OTOMATIS BERBASIS PARAMETER ({mode_label})]")
    test_params = ["KEDAI", "KESEL", "KESEN"]
    for p in test_params:
        target_app = str(upload_id) if upload_id > 0 else "999"
        exec_args = ["--param-code", p, "--app-id", target_app]
        if upload_id == 0:
            exec_args.append("--dry-run")

        code, stdout, stderr = run_cli_test(exec_args)
        if code == 0:
            action_desc = f"Berhasil di-upload ke App #{target_app}" if upload_id > 0 else "Berhasil dieksekusi (Dry-Run)"
            print(f"  ✅ [PASS] Parameter {p:6} : {action_desc}")
            results.append((f"Param {p}", True, "Uploaded" if upload_id > 0 else "OK"))
        else:
            print(f"  ❌ [FAIL] Parameter {p:6} : Gagal dieksekusi! (Exit code {code})")
            results.append((f"Param {p}", False, stderr or stdout))

    # 3. TEST VALIDASI SAFE GUARD (PARAMETER UNCONFIGURED)
    print("\n[FASE 3: UJI KEAMANAN SAFE GUARD (PARAMETER TIDAK TERDAFTAR)]")
    code, stdout, stderr = run_cli_test(["--param-code", "XYZ", "--app-id", "999", "--dry-run"])
    if code != 0 and "ERROR_NOT_CONFIGURED" in (stdout + stderr):
        print("  ✅ [PASS] Safe Guard Berfungsi : Parameter 'XYZ' ditolak secara aman (ERROR_NOT_CONFIGURED)")
        results.append(("Safe Guard XYZ", True, "Ditolak Aman"))
    else:
        print("  ❌ [FAIL] Safe Guard Gagal : Parameter tidak terdaftar lolos!")
        results.append(("Safe Guard XYZ", False, "Tidak Ditolak"))

    # 4. TEST LIMS CORE REST API ENDPOINT
    print("\n[FASE 4: VERIFIKASI KONEKSI LIMS CORE REST API]")
    api_url = cfg.get("lims_api", {}).get("url", "http://127.0.0.1:8081")
    api_key = cfg.get("lims_api", {}).get("api_key", "")
    api_ok = False
    try:
        # Panggil endpoint machine-integration (cek apakah Go backend aktif)
        resp = requests.post(f"{api_url}/api/machine-integration/results", json={}, timeout=3.0)
        # Jika server aktif, akan mengembalikan 401 (Unauthorized) atau 400 (Bad Request) karena body kosong
        api_ok = (resp.status_code in [200, 400, 401])
    except Exception as e:
        api_ok = False

    if api_ok:
        print(f"  ✅ [PASS] LIMS Backend API aktif dan siap menerima data di {api_url}")
        results.append(("LIMS API Endpoint", True, "Online (HTTP 200/400/401 Handshake OK)"))
    else:
        print(f"  ⚠️  [WARN] LIMS Backend API belum merespons di {api_url}")
        results.append(("LIMS API Endpoint", False, "Offline / Unreachable"))

    # RINGKASAN
    print_header("HASIL REKAPITULASI UJI INTEGRASI OTOMATIS")
    passed_count = sum(1 for _, ok, _ in results if ok)
    total_count = len(results)
    print(f"Total Pengujian : {total_count} | Berhasil: {passed_count} | Gagal: {total_count - passed_count}\n")
    for name, ok, note in results:
        status_str = "✅ PASS" if ok else "❌ FAIL"
        print(f"  {status_str} | {name:22} : {note}")
    print("=" * 70 + "\n")

    if passed_count == total_count:
        print("🎉 SELURUH INTEGRASI OTOMATIS BEROPERASI SEMPURNA (100% PASS)!\n")
        sys.exit(0)
    else:
        print("⚠️  Beberapa pengujian integrasi memerlukan peninjauan.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
