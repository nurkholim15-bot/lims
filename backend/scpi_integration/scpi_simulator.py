#!/usr/bin/env python3
"""
LIMS SCPI Mock Instrument Simulator (Digital Twin)
==================================================
Mensimulasikan respons perintah SCPI (Standard Commands for Programmable Instruments)
untuk tiga instrumen uji laboratorium:
1. Siglent SDS2354X HD (Digital Oscilloscope) - Port TCP 5025
2. Siglent SSA5085A (Spectrum Analyzer)       - Port TCP 5026
3. WDS WDW5A (Universal Testing Machine 5 kN) - Port TCP 5027

Dapat dijalankan di Windows, Linux (Ubuntu/WSL), atau VPS untuk pengujian
otomatisasi tanpa memerlukan instrumen fisik lab.
"""

import sys
import os
import socket
import threading
import random
import time
import math
import argparse

class MockInstrumentServer(threading.Thread):
    def __init__(self, host, port, instrument_type, name):
        super().__init__()
        self.host = host
        self.port = port
        self.instrument_type = instrument_type
        self.name = name
        self.running = True
        self.server_socket = None
        self.start_time = time.time()

    def run(self):
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            print(f"[{self.instrument_type}] Standby di {self.host}:{self.port} ({self.name})")
        except Exception as e:
            print(f"[{self.instrument_type}] Gagal bind ke {self.host}:{self.port} - {e}")
            return

        while self.running:
            try:
                client, addr = self.server_socket.accept()
                threading.Thread(target=self.handle_client, args=(client, addr), daemon=True).start()
            except Exception:
                break

    def handle_client(self, client, addr):
        buffer = ""
        while self.running:
            try:
                data = client.recv(1024)
                if not data:
                    break
                buffer += data.decode('utf-8', errors='ignore')
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    cmd = line.strip()
                    if not cmd:
                        continue
                    resp = self.process_command(cmd)
                    if resp is not None:
                        client.sendall((resp + "\n").encode('utf-8'))
            except Exception:
                break
        try:
            client.close()
        except Exception:
            pass

    def process_command(self, cmd):
        cmd_upper = cmd.upper()

        # =========================================================================
        # 1. SIGLENT SDS2354X HD OSCILLOSCOPE (PORT 5025)
        # =========================================================================
        if self.instrument_type == "OSCILLOSCOPE":
            if cmd == "*IDN?":
                return "Siglent Technologies,SDS2354X HD,SDS2HD0001,1.2.1.8"
            elif cmd == "*RST" or cmd == "*CLS":
                return None
            elif cmd == "*OPC?":
                return "1"
            elif ":MEAS" in cmd_upper and "SOUR" in cmd_upper:
                return "OK"
            elif "VPP" in cmd_upper or ":PAVA? VPP" in cmd_upper:
                # Simulasi tegangan puncak ~3.3V dengan sedikit variasi realistis (±15mV)
                val = 3.300 + random.uniform(-0.015, 0.015)
                return f"VPP,{val:.4f}V"
            elif "FREQ" in cmd_upper or ":PAVA? FREQ" in cmd_upper:
                # Simulasi frekuensi 50.0 kHz (±3 Hz)
                freq = 50000.0 + random.uniform(-3.0, 3.0)
                return f"FREQ,{freq:.2f}Hz"
            elif "PKPK" in cmd_upper:
                val = 3.320 + random.uniform(-0.02, 0.02)
                return f"PKPK,{val:.4f}V"
            elif "RISE" in cmd_upper or ":PAVA? RISE" in cmd_upper:
                return "RISE,1.245E-08s"
            elif "WAV:DATA?" in cmd_upper or ":WAVEFORM:DATA?" in cmd_upper:
                # Generate sample waveform points (sinusoidal)
                points = [f"{math.sin(i * 0.1):.3f}" for i in range(50)]
                return ",".join(points)
            else:
                return "OK"

        # =========================================================================
        # 2. SIGLENT SSA5085A SPECTRUM ANALYZER (PORT 5026)
        # =========================================================================
        elif self.instrument_type == "SPECTRUM_ANALYZER":
            if cmd == "*IDN?":
                return "Siglent Technologies,SSA5085A,SSA5A0001,2.1.1.2"
            elif cmd == "*RST" or cmd == "*CLS":
                return None
            elif cmd == "*OPC?":
                return "1"
            elif ":CALC:MARK1:MAX" in cmd_upper or ":CALCULATE:MARKER1:MAXIMUM" in cmd_upper:
                return "OK"
            elif ":CALC:MARK1:X?" in cmd_upper or ":CALCULATE:MARKER1:X?" in cmd_upper or ":CALCULATE:MARKER1:X" in cmd_upper:
                # Puncak pada 2.440 GHz (ISM Band) ± 500 Hz
                freq = 2440000000.0 + random.uniform(-500, 500)
                return f"{freq:.3f}"
            elif ":CALC:MARK1:Y?" in cmd_upper or ":CALCULATE:MARKER1:Y?" in cmd_upper or ":CALCULATE:MARKER1:Y" in cmd_upper:
                # Daya sinyal puncak -12.4 dBm (±0.25 dBm)
                power = -12.4 + random.uniform(-0.25, 0.25)
                return f"{power:.2f}"
            elif ":CALC:OBW:OBW?" in cmd_upper or ":CALCULATE:OBWIDTH:OBWIDTH?" in cmd_upper:
                # Occupied bandwidth ~ 18.45 MHz
                obw = 18450000.0 + random.uniform(-2000, 2000)
                return f"{obw:.1f}"
            elif ":CALC:LLIN1:FAIL?" in cmd_upper or ":CALCULATE:LLINE1:FAIL?" in cmd_upper:
                # 0 = PASS (Lolos ambang batas CISPR EMI)
                return "0"
            else:
                return "OK"

        # =========================================================================
        # 3. WDS WDW5A UNIVERSAL TESTING MACHINE (PORT 5027)
        # =========================================================================
        elif self.instrument_type == "UTM":
            if cmd in ["*IDN?", "$GET_MACHINE_INFO", "ID?"]:
                return "WDS,WDW5A,CAP_5000N,ACCURACY_0.5,FW_V4.2"
            elif cmd == "*OPC?":
                return "1"
            elif "$READ_TEST_RESULT" in cmd_upper or "READ?" in cmd_upper:
                # Simulasi kurva uji tarik material bertahap seiring berjalannya waktu
                elapsed = (time.time() - self.start_time) % 60.0
                fraction = min(1.0, elapsed / 50.0) # Mencapai puncak dalam 50 detik
                current_load = (4.750 * (1.0 - math.exp(-3.2 * max(0.01, fraction)))) + random.uniform(-0.02, 0.02)
                current_load = max(0.200, current_load)
                area_mm2 = 12.5 # Luas penampang standar spesimen 12.5 mm²
                tensile_str = (current_load * 1000.0) / area_mm2
                elongation = (23.45 * fraction) + random.uniform(-0.1, 0.1)
                disp = (14.85 * fraction) + random.uniform(-0.05, 0.05)
                status = "PULLING" if fraction < 0.95 else "TEST_COMPLETED"
                return f"PEAK_LOAD:{current_load:.3f}kN;TENSILE_STR:{tensile_str:.2f}MPa;ELONGATION:{elongation:.2f}%;DISP:{disp:.2f}mm;STATUS:{status}"
            elif ":MEAS:LOAD:PEAK?" in cmd_upper or "LOAD:PEAK?" in cmd_upper:
                peak_load = 4.750 + random.uniform(-0.100, 0.100)
                return f"{peak_load:.3f}"
            elif ":MEAS:STRESS:MAX?" in cmd_upper or "STRESS:MAX?" in cmd_upper:
                tensile_str = 380.0 + random.uniform(-5.0, 5.0)
                return f"{tensile_str:.2f}"
            elif ":MEAS:STRAIN:BREAK?" in cmd_upper or "STRAIN:BREAK?" in cmd_upper:
                elong = 23.5 + random.uniform(-0.5, 0.5)
                return f"{elong:.2f}"
            else:
                return "OK"

        return "ERR_UNKNOWN_COMMAND"

    def stop(self):
        self.running = False
        if self.server_socket:
            try:
                self.server_socket.close()
            except Exception:
                pass

def main():
    parser = argparse.ArgumentParser(description="LIMS SCPI Mock Instrument Simulator")
    parser.add_argument("--host", default="0.0.0.0", help="Host address to bind (default: 0.0.0.0)")
    parser.add_argument("--osc-port", type=int, default=5025, help="Oscilloscope Port (default: 5025)")
    parser.add_argument("--spec-port", type=int, default=5026, help="Spectrum Analyzer Port (default: 5026)")
    parser.add_argument("--utm-port", type=int, default=5027, help="UTM Port (default: 5027)")
    args = parser.parse_args()

    print("=" * 70)
    print("  LIMS SCPI DIGITAL TWIN MOCK INSTRUMENT SIMULATOR")
    print("=" * 70)
    print("Memulai emulasi instrumen laboratorium...")

    servers = [
        MockInstrumentServer(args.host, args.osc_port, "OSCILLOSCOPE", "Siglent SDS2354X HD"),
        MockInstrumentServer(args.host, args.spec_port, "SPECTRUM_ANALYZER", "Siglent SSA5085A"),
        MockInstrumentServer(args.host, args.utm_port, "UTM", "WDS WDW5A (5 kN)")
    ]

    for s in servers:
        s.daemon = True
        s.start()

    print("-" * 70)
    print(f"1. Siglent SDS2354X HD (Oscilloscope)      -> Port {args.osc_port}")
    print(f"2. Siglent SSA5085A (Spectrum Analyzer)    -> Port {args.spec_port}")
    print(f"3. WDS WDW5A (Universal Testing Machine)   -> Port {args.utm_port}")
    print("-" * 70)
    print("Tekan Ctrl+C untuk menghentikan simulator.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SIMULATOR] Menghentikan semua server simulator...")
        for s in servers:
            s.stop()
        sys.exit(0)

if __name__ == "__main__":
    main()
