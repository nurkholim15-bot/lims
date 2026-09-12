# LIMS SCPI Integration & Digital Twin Simulator

Paket modul integrasi otomatisasi instrumen laboratorium berbasis **SCPI (Standard Commands for Programmable Instruments)** untuk tiga instrumen lab utama:
1. **Siglent SDS2354X HD** (Digital Oscilloscope) - Port TCP `5025`
2. **Siglent SSA5085A** (Spectrum Analyzer) - Port TCP `5026`
3. **WDS WDW5A** (Universal Testing Machine 5 kN) - Port TCP `5027`

---

## 1. Berkas dalam Direktori Ini

| Berkas | Keterangan & Fungsi |
| :--- | :--- |
| **`scpi_simulator.py`** | Server Digital Twin Simulator multi-threaded yang mengemulasikan respons ketiga instrumen fisik via raw TCP socket. |
| **`lims_scpi_agent.py`** | Client / Edge Gateway Agent yang mengirim query SCPI ke alat/simulator dan mengirim hasilnya ke LIMS Core API (`POST /api/machine-integration/results`). |

---

## 2. Cara Menjalankan Digital Twin Mock Simulator

Buka terminal (PowerShell di Windows, atau terminal di Linux/WSL/VPS):

```bash
# Pindah ke direktori scpi_integration
cd backend/scpi_integration

# Jalankan simulator
python scpi_simulator.py
```

Output yang akan muncul di layar:
```text
======================================================================
  LIMS SCPI DIGITAL TWIN MOCK INSTRUMENT SIMULATOR
======================================================================
Memulai emulasi instrumen laboratorium...
[OSCILLOSCOPE] Standby di 0.0.0.0:5025 (Siglent SDS2354X HD)
[SPECTRUM_ANALYZER] Standby di 0.0.0.0:5026 (Siglent SSA5085A)
[UTM] Standby di 0.0.0.0:5027 (WDS WDW5A (5 kN))
----------------------------------------------------------------------
1. Siglent SDS2354X HD (Oscilloscope)      -> Port 5025
2. Siglent SSA5085A (Spectrum Analyzer)    -> Port 5026
3. WDS WDW5A (Universal Testing Machine)   -> Port 5027
----------------------------------------------------------------------
Tekan Ctrl+C untuk menghentikan simulator.
```

---

## 3. Cara Menguji Penarikan Data (SCPI Client Agent)

Buka jendela terminal kedua:

### A. Uji Coba Pembacaan Saja (Dry Run - Tanpa Mengirim ke Database LIMS)
```bash
python lims_scpi_agent.py --dry-run
```

Hasil pembacaan dari ketiga simulator akan langsung tampil di terminal:
- **Oscilloscope**: Nilai identitas `*IDN?`, tegangan puncak $V_{pp}$ (Volt), dan frekuensi (Hz).
- **Spectrum Analyzer**: Nilai frekuensi puncak (GHz), daya sinyal puncak (dBm), dan *Occupied Bandwidth* (MHz).
- **UTM**: Nilai beban puncak ($F_{max}$ kN), kuat tarik (MPa), dan elongasi regangan (%).

### B. Membaca Instrumen Tertentu Saja
```bash
# Hanya Oscilloscope
python lims_scpi_agent.py --target osc --dry-run

# Hanya Spectrum Analyzer
python lims_scpi_agent.py --target spec --dry-run

# Hanya UTM
python lims_scpi_agent.py --target utm --dry-run
```

### C. Menghubungkan ke Instrumen Fisik Nyata di Jaringan Lab
Saat dihubungkan ke instrumen fisik nyata di jaringan laboratorium, cukup ubah alamat IP target:
```bash
python lims_scpi_agent.py --host 192.168.1.105 --app-id 38
```

### D. Mengirimkan Data ke LIMS Core REST API
```bash
python lims_scpi_agent.py --api-url http://127.0.0.1:8081 --app-id 38
```
Data akan otomatis masuk ke tabel `mecs.simulator_data_logs` dan secara otomatis memperbarui nilai di tabel `mecs.testing_results` untuk permohonan uji dengan ID 38.
