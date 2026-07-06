import os

file_path = r'd:\Data_NK\Project5\AI\LIM System\frontend\src\utils\print.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line numbers in the tool are 1-indexed.
# Current state:
# 131:     }
# 132: };
# 133: (blank)
# 134:     // Generate QR code locally

missing_block = """
export const printTechnicalReport = async (a, executionData = [], locationsMap = [], options = {}) => {
    const { 
        headerTitle = "LAPORAN TEKNIS HASIL PENGUJIAN", 
        appConfig = {} 
    } = options;
    
    const headerSubtitle = appConfig.HEADER_TITLE || "LIMS";
    const adminLabel = appConfig.APP_ADMIN_NAME || "LIMS Authorization Badge";
    const footerText = appConfig.APP_FOOTER || "Laporan Teknis LIMS - Dokumen Rahasia & Terbatas";

    if (!a) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    // Show loading message
    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Menyiapkan Laporan...</div></body></html>`);
"""

# Insert between line 133 (index 132) and 134 (index 133)
lines.insert(133, missing_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Restoration complete.")
