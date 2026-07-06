import QRCode from 'qrcode';

/**
 * Escape HTML entities untuk mencegah Stored XSS pada output document.write().
 * Wajib digunakan pada semua data yang berasal dari database sebelum
 * dimasukkan ke dalam template string HTML di fungsi print.
 */
const escapeHtml = (str) => {
    if (str === null || str === undefined) return '-';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const formatIDDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};


export const printRegistrationProof = async (a, appConfig = {}) => {
    if (!a) return;
    
    const headerTitle = appConfig.HEADER_TITLE || "LIMS";
    const headerSubtitle = appConfig.COMPANY_NAME || "Laboratory Information Management System";
    const adminName = appConfig.APP_ADMIN_NAME || "LIMS Administrator";
    const footerText = appConfig.APP_FOOTER || "Dokumen ini adalah bukti registrasi sah.";

    // 1. Open window immediately to prevent popup blocker
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    // 2. Show loading message
    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Memuat data...</div></body></html>`);

    try {
        // 3. Generate QR code locally
        const qrDataUrl = await QRCode.toDataURL(a.reg_number, { margin: 1, width: 200 });

        // 4. Update window content
        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Bukti Registrasi - ${a.reg_number}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 5px 10px; color: #1e293b; line-height: 1.3; font-size: 8.5pt; }
                    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
                    .logo { width: 40px; height: auto; }
                    .header-text { flex: 1; text-align: left; }
                    h1 { color: #0f172a; margin: 0; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; }
                    .info-grid { display: grid; grid-template-columns: 120px 1fr; gap: 2px 8px; margin-top: 6px; }
                    .label { font-weight: bold; color: #64748b; }
                    .value { color: #1e293b; }
                    .footer { margin-top: 15px; text-align: center; font-size: 0.7rem; color: #94a3b8; border-top: 1px solid #cbd5e1; padding-top: 6px; }
                    .stamp { margin-top: 10px; text-align: right; padding-right: 20px; font-size: 0.8rem; }
                    h3 { margin-top: 8px; border-left: 4px solid #10b981; padding-left: 8px; font-size: 0.9rem; margin-bottom: 4px; }
                    @media print { 
                        @page { margin: 8mm; size: portrait; }
                        body { padding: 0; }
                        .no-print { display: none; } 
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" class="logo">
                    <div class="header-text">
                        <h1>${headerTitle}</h1>
                        <p style="margin: 3px 0; color: #64748b; font-weight: 600;">${headerSubtitle}</p>
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="info-grid" style="margin-top: 0; flex: 1;">
                        <div class="label">Nomor Registrasi</div><div class="value">: <strong>${a.reg_number}</strong></div>
                        <div class="label">Tanggal Registrasi</div><div class="value">: ${formatIDDate(a.created_at)}</div>
                        <div class="label">Application ID (IoT)</div><div class="value">: <strong>${a.id}</strong></div>
                        <div class="label">Status</div><div class="value">: ${a.status}</div>

                        <div style="grid-column: span 2; border-top: 1px dashed #cbd5e1; margin: 6px 0;"></div>

                        <div class="label">Paket Layanan</div>
                        <div class="value">: ${a.package ? `<strong style="color: #7c3aed;">${a.package.package_code} - ${a.package.name}</strong>` : 'Uji Mandiri (Custom)'}</div>
                        
                        ${a.package ? `
                            <div class="label">Biaya Paket</div><div class="value">: <strong>Rp ${a.package.base_price?.toLocaleString() || 0}</strong></div>
                            <div class="label">Detil Paket</div><div class="value">: ${a.package.methodologies?.map(m => m.name).join(", ") || "Tes Standar Sesuai Paket"}</div>
                        ` : ''}
                    </div>
                    <div style="text-align: center; margin-left: 15px; flex-shrink: 0;">
                        <img src="${qrDataUrl}" style="width: 80px; height: 80px; border: 1px solid #cbd5e1; padding: 4px; background: white; border-radius: 4px;">
                        <div style="font-size: 7.5pt; font-weight: bold; color: #64748b; margin-top: 4px;">SCAN VERIFIKASI</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; margin-top: 8px; align-items: flex-start;">
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin-top: 0;">Informasi Peralatan</h3>
                        <div class="info-grid">
                            <div class="label">Nama Peralatan</div><div class="value">: ${a.equipment?.equipment_name || '-'}</div>
                            <div class="label">Kategori Materiil</div><div class="value">: ${a.equipment?.category?.name || '-'}</div>
                            <div class="label">Merk / Brand</div><div class="value">: ${a.equipment?.brand?.name || '-'}</div>
                            <div class="label">Tipe / Model</div><div class="value">: ${a.equipment?.model?.name || '-'}</div>
                            <div class="label">Varian</div><div class="value">: ${a.equipment?.variant?.name || '-'}</div>
                            <div class="label">No. Batch / Seri</div><div class="value">: ${a.equipment?.batch_number || '-'}</div>
                            <div class="label">Negara Asal</div><div class="value">: ${a.equipment?.brand?.origin?.name || a.equipment?.brand?.origin_code || '-'}</div>
                            <div class="label">Spesifikasi Teknis</div><div class="value">: ${a.equipment?.technical_spec || '-'}</div>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin-top: 0;">Informasi Pemohon</h3>
                        <div class="info-grid">
                            <div class="label">Rekanan / Instansi</div><div class="value">: ${a.partner ? a.partner.name : '-'}</div>
                            <div class="label">Kategori Pemohon</div><div class="value">: ${a.partner?.type?.name || a.partner?.type_code || '-'}</div>
                            <div class="label">Alamat</div><div class="value">: ${a.partner?.alamat || '-'}</div>
                            <div class="label">Kota</div><div class="value">: ${a.partner?.city?.city_name || a.partner?.city_code || '-'}</div>
                            <div class="label">Nama PIC</div><div class="value">: ${a.partner?.pic_name || '-'}</div>
                            <div class="label">Email PIC</div><div class="value">: ${a.partner?.pic_email || '-'}</div>
                            <div class="label">Telepon PIC</div><div class="value">: ${a.partner?.pic_phone || '-'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="stamp">
                    <p>Dicetak secara sistem pada:<br>${formatIDDate(new Date())}</p>
                    <div style="margin-top: 20px; font-weight: bold;">${adminName}</div>
                </div>
                
                <div class="footer">
                    ${footerText}
                </div>
                <script>
                    window.onload = () => { 
                        setTimeout(() => {
                            window.print(); 
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (err) {
        console.error("Print error:", err);
        printWindow.document.write(`<div style="color: red;">Gagal memproses QR Code. Silakan coba lagi.</div>`);
    }
};


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
    // Generate QR code locally
    const qrDataUrl = await QRCode.toDataURL(a.reg_number, { margin: 1, width: 200 });

    const isInitialStage = ["REGISTERED", "VERIFIED", "APPROVED", "PLANNED", "REVISI"].includes((a.status || "").toUpperCase());

    const safeParsePlans = (plansStr) => {
        try {
            return typeof plansStr === "string" ? JSON.parse(plansStr) : (plansStr || []);
        } catch {
            return [];
        }
    };

    const calculateFinalHierarchyScore = (items) => {
        const aspectMap = {};
        items.forEach(p => {
          const key = p.aspect_code || "GENERAL";
          if (!aspectMap[key]) {
            aspectMap[key] = { items: [], weight: p.aspect_weight || 0 };
          }
          aspectMap[key].items.push(p);
        });
    
        let weightedSum = 0;
        let totalWeight = 0;
        let minAspectScore = 100;
    
        const groups = Object.entries(aspectMap);
        if (groups.length === 0) return { finalScore: 0, minAspectScore: 0 };
    
        groups.forEach(([aspCode, asp]) => {
          // Check for persisted score (manual/cached) in testing_aspect_scores
          const persistedAspect = (a.aspect_scores || []).find(s => 
            (s.aspect_code || "").toString().trim().toUpperCase() === aspCode.toString().trim().toUpperCase()
          );

          let aspScore;
          if (persistedAspect) {
            aspScore = persistedAspect.score;
          } else if (isInitialStage) {
            // For PLANNED and earlier, we don't assume or calculate from raw items if they are zero/empty
            aspScore = 0;
          } else {
            let subWeighted = 0;
            let subWeight = 0;
            asp.items.forEach(sub => {
              const val = parseFloat(sub.actual_value) || 0;
              subWeighted += val * (sub.weight || 0);
              subWeight += (sub.weight || 0);
            });
            aspScore = subWeight > 0 ? subWeighted / subWeight : 0;
          }

          weightedSum += aspScore * asp.weight;
          totalWeight += asp.weight;
          if (asp.weight > 0) minAspectScore = Math.min(minAspectScore, aspScore);
        });
    
        return {
          finalScore: totalWeight > 0 ? weightedSum / totalWeight : 0,
          minAspectScore: minAspectScore === 100 ? 0 : minAspectScore
        };
    };

    const labResults = executionData.filter(r => {
        const tc = (r.test_type_code || "").toUpperCase();
        return tc === 'LAB' || tc === 'LABORATORIUM' || tc === 'FNL' || tc === 'REL' || tc === 'SAF';
    });
    const fieldResults = executionData.filter(r => {
        const tc = (r.test_type_code || "").toUpperCase();
        return tc === 'FLD' || tc === 'FIELD' || tc === 'LAPANGAN';
    });
    const managementResults = executionData.filter(r => {
        const tc = (r.test_type_code || "").toUpperCase();
        const isLab = ['LAB', 'LABORATORIUM', 'FNL', 'REL', 'SAF'].includes(tc);
        const isField = ['FLD', 'FIELD', 'LAPANGAN'].includes(tc);
        return !isLab && !isField && tc !== "";
    });

    const finalCalc = calculateFinalHierarchyScore([...labResults, ...fieldResults, ...managementResults]);
    const totalScoreAvg = a.final_score || finalCalc.finalScore;
    const finalStatusLabel = a.final_status || (isInitialStage ? "-" : (totalScoreAvg >= 65 ? "LULUS" : "TIDAK LULUS"));
    const isLulusValue = finalStatusLabel.toUpperCase().includes("LULUS") && !isInitialStage;

    const renderAspectSections = (items, testType) => {
        if (!items || items.length === 0) return '';

        const aspectMap = {};
        items.forEach(p => {
            const key = p.aspect_code || "GENERAL";
            if (!aspectMap[key]) {
                aspectMap[key] = {
                    code: key,
                    name: p.aspect_name || p.method_name || "Lainnya",
                    weight: p.aspect_weight || 0,
                    items: [],
                };
            }
            aspectMap[key].items.push(p);
        });

        const aspectGroups = Object.values(aspectMap);
        const allPlans = safeParsePlans(a.test_plans);
        const isLab = testType === 'LAB';

        return `
            <div style="margin-top: 20px;">
                <h3 style="background: #f1f5f9; padding: 6px 12px; border-left: 5px solid #1e293b; color: #1e293b; font-size: 1rem; margin-bottom: 8px;">
                    ${testType === 'LAB' ? '1. HASIL PENGUJIAN LABORATORIUM' : (testType === 'FIELD' ? '2. HASIL PENGUJIAN LAPANGAN' : '3. HASIL PENGUJIAN UMUM')}
                </h3>
                
                ${aspectGroups.map(asp => {
                    // Check for persisted score (manual/cached) in testing_aspect_scores
                    const persistedAspect = (a.aspect_scores || []).find(s => 
                        (s.aspect_code || "").toString().trim().toUpperCase() === asp.code.toString().trim().toUpperCase()
                    );

                    let aspScore;
                    if (persistedAspect) {
                        aspScore = persistedAspect.score;
                    } else if (isInitialStage) {
                        aspScore = 0;
                    } else {
                        let subWeightedSum = 0;
                        let subTotalWeight = 0;
                        asp.items.forEach(sub => {
                            subWeightedSum += (parseFloat(sub.actual_value) || 0) * (sub.weight || 0);
                            subTotalWeight += (sub.weight || 0);
                        });
                        aspScore = subTotalWeight > 0 ? subWeightedSum / subTotalWeight : 0;
                    }

                    const plan = allPlans.find(p => p.type === testType && p.aspect_code === asp.code);
                    const getTeamDisplay = (aspCode, testType) => {
                        let names = [];
                        
                        // 1. Try to get team from tester_applications table (preferred)
                        const aspectTesters = Array.isArray(a.tester_applications) 
                            ? a.tester_applications.filter(t => t.aspect_code === aspCode)
                            : [];
                        
                        if (aspectTesters.length > 0) {
                            names = aspectTesters.map(t => t.tester?.name || t.tester_id || t.name);
                        } else {
                            // 2. Fallback to plan-specific team (if stored in test_plans JSON)
                            if (plan?.team && Array.isArray(plan.team) && plan.team.length > 0) {
                                names = plan.team.map(m => m.name || m.tester_name || m);
                            } else {
                                // 3. Last fallback: Application-level teams
                                const labs = Array.isArray(a.lab_teams) ? a.lab_teams : [];
                                const fields = Array.isArray(a.field_teams) ? a.field_teams : [];
                                const allAppTeams = [...labs, ...fields];
                                names = allAppTeams.map(t => t.tester?.name || t.tester_name || t.name || t.tester_id);
                            }
                        }
                        
                        // Deduplicate and clean
                        const uniqueNames = Array.from(new Set(names.filter(n => n && typeof n === 'string' && n !== 'undefined' && n !== 'null'))).filter(n => n);
                        return uniqueNames.length > 0 ? uniqueNames.join(", ") : "-";
                    };

                    const teamDisp = getTeamDisplay(asp.code, testType);
                    
                    const getLocDisplay = (aspCode) => {
                        // 1. Try testing_plans table (preferred)
                        const aspectPlan = Array.isArray(a.testing_plans) 
                            ? a.testing_plans.find(p => p.aspect_code === aspCode)
                            : null;
                        
                        const targetCode = aspectPlan?.location_code || plan?.location_code;
                        const targetName = aspectPlan?.location?.name || plan?.location_name;

                        if (targetCode) {
                            let lName = targetName || "";
                            if (!lName && Array.isArray(locationsMap)) {
                                lName = locationsMap.find(l => l.code === targetCode)?.name || "";
                            }
                            return lName ? `${targetCode} - ${lName}` : targetCode;
                        }
                        
                        // Fallbacks
                        const equipLoc = a.equipment?.asset_location;
                        if (equipLoc?.name) return equipLoc.code ? `${equipLoc.code} - ${equipLoc.name}` : equipLoc.name;
                        
                        const appLoc = a.lab_location || a.field_location || a.location;
                        if (appLoc?.name) return appLoc.code ? `${appLoc.code} - ${appLoc.name}` : appLoc.name;
                        return a.lab_location_code || a.field_location_code || a.location_code || "-";
                    };

                    const locDisp = getLocDisplay(asp.code);

                    const displayScore = isInitialStage && !persistedAspect ? "0.00" : aspScore.toFixed(2);

                    return `
                        <div style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; page-break-inside: avoid;">
                            <div style="background: #f8fafc; padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 800; color: #1e293b; font-size: 9.5pt;">ASPEK: ${asp.name} <span style="font-weight: 400; color: #64748b; margin-left: 10px;">(${asp.code})</span></span>
                                    <div style="font-weight: 800; color: #047857; font-size: 10pt;">Skor Aspek: ${displayScore}</div>
                                </div>
                                <div style="display: grid; grid-template-columns: 80px 1fr 80px 1.5fr; gap: 0px 10px; font-size: 8pt; color: #475569; margin-top: 2px;">
                                    <strong>Lokasi:</strong> <span>${locDisp}</span>
                                    <strong>Bobot:</strong> <span>${asp.weight}% dari Total</span>
                                    <strong>Team:</strong> <span style="grid-column: span 3;">${teamDisp}</span>
                                </div>
                            </div>
                            <table class="details-table" style="margin: 0; border: none;">
                                <thead>
                                    <tr style="background: #ffffff;">
                                        <th style="font-size: 8pt; color: #64748b; padding: 3px 10px; border-top: none;">Parameter</th>
                                        <th width="40" style="text-align: center; font-size: 8pt; color: #64748b; padding: 3px 10px; border-top: none;">Skor</th>
                                        <th width="40" style="text-align: center; font-size: 8pt; color: #64748b; padding: 3px 10px; border-top: none;">Bobot</th>
                                        <th width="50" style="text-align: center; font-size: 8pt; color: #64748b; padding: 3px 10px; border-top: none;">Hasil</th>
                                        <th style="font-size: 8pt; color: #64748b; padding: 3px 10px; border-top: none;">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${asp.items.map(r => {
                                        const actualVal = isInitialStage ? 0 : (parseFloat(r.actual_value) || 0);
                                        const resultVal = ((actualVal * (r.weight || 0)) / 100);
                                        return `
                                        <tr>
                                            <td style="font-size: 8.5pt; padding: 3px 10px;">${r.parameter_name}</td>
                                            <td align="center" style="font-size: 8.5pt; padding: 3px 10px;">${actualVal === 0 && isInitialStage ? '-' : actualVal}</td>
                                            <td align="center" style="font-size: 8.5pt; color: #64748b; padding: 3px 10px;">${r.weight || 0}%</td>
                                            <td align="center" style="font-size: 8.5pt; padding: 3px 10px;"><strong>${resultVal === 0 && isInitialStage ? '-' : resultVal.toFixed(2)}</strong></td>
                                            <td style="font-size: 8.5pt; padding: 3px 10px;">${escapeHtml(r.notes)}</td>
                                        </tr>
                                    `;}).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Laporan Teknis - ${a.reg_number}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; line-height: 1.3; font-size: 9.5pt; }
                .header { display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
                .logo { width: 55px; height: auto; }
                .header-text { flex-grow: 1; }
                .header-text h1 { margin: 0; font-size: 1.3rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.2px; font-weight: 800; }
                .header-text p { margin: 1px 0 0; font-weight: 600; color: #475569; font-size: 0.9rem; }
                
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
                .info-item { display: grid; grid-template-columns: 130px 1fr; align-items: start; gap: 8px; }
                .info-label { font-size: 7.5pt; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .info-label::after { content: " :"; float: right; }
                .info-value { font-size: 9pt; color: #1e293b; font-weight: 600; word-break: break-word; line-height: 1.1; }
                
                .details-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .details-table th, .details-table td { border: 1px solid #e2e8f0; padding: 5px 10px; }
                .details-table th { background: #f8fafc; font-weight: 700; text-align: left; color: #475569; }

                .summary-box { display: grid; grid-template-columns: 1.5fr 1fr; gap: 15px; margin-top: 20px; page-break-inside: avoid; align-items: start; }
                .score-card { border: 2px solid #10b981; border-radius: 10px; padding: 10px; display: flex; justify-content: space-around; align-items: center; background: #f0fdf4; }
                .score-item { text-align: center; }
                .score-label { font-size: 0.7rem; color: #065f46; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
                .score-value { font-size: 1.6rem; font-weight: 800; color: #047857; }
                
                .conclusion { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 9pt; }
                
                .footer { margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 0.75rem; color: #94a3b8; }
                .sign-area { margin-top: 30px; display: flex; justify-content: flex-end; }
                .sign-box { text-align: right; width: 220px; font-size: 9pt; }
                
                @media print { 
                    @page { size: auto; margin: 0mm; }
                    body { padding: 15mm; margin: 0; }
                    .no-print { display: none; }
                    .info-grid { background: #f8fafc !important; -webkit-print-color-adjust: exact; border: 1px solid #e2e8f0 !important; }
                    .score-card { background: #f0fdf4 !important; -webkit-print-color-adjust: exact; border: 2px solid #10b981 !important; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="/logo.png" class="logo">
                <div class="header-text">
                    <h1>${headerTitle}</h1>
                    <p>${headerSubtitle}</p>
                </div>
            </div>

            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 15px;">
                <div class="info-grid" style="flex: 1; margin-bottom: 0;">
                    <div class="info-item">
                        <div class="info-label">Nomor Registrasi</div>
                        <div class="info-value">${a.reg_number}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">App ID (IoT)</div>
                        <div class="info-value" style="color: #10b981;">${a.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status App</div>
                        <div class="info-value"><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${a.status}</span></div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Tanggal Analisa</div>
                        <div class="info-value">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                    </div>

                    <div class="info-item">
                        <div class="info-label">Nama Peralatan</div>
                        <div class="info-value">${a.equipment?.equipment_name || '-'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Merk / Brand</div>
                        <div class="info-value">${a.equipment?.brand?.name || '-'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">No. Batch / Seri</div>
                        <div class="info-value">${a.equipment?.batch_number || '-'}</div>
                    </div>

                    <div class="info-item">
                        <div class="info-label">Kategori / Model</div>
                        <div class="info-value">${a.equipment?.category?.name || '-'} / ${a.equipment?.model?.name || '-'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Asal / Pabrikan</div>
                        <div class="info-value">${a.equipment?.brand?.origin?.name || a.equipment?.brand?.origin_code || '-'}</div>
                    </div>


                    <div class="info-item" style="grid-column: span 2;">
                        <div class="info-label">Rekanan / Pemohon</div>
                        <div class="info-value">${a.partner ? a.partner.name : '-'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">No. Sertifikat</div>
                        <div class="info-value">${a.certificate_num || (isLulusValue ? 'CERT/MEC/' + a.reg_number.split('-').pop() : '-')}</div>
                    </div>
                    
                    <div class="info-item" style="grid-column: span 2;">
                        <div class="info-label">Status Kelulusan</div>
                        <div class="info-value"><span style="font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${isLulusValue ? '#dcfce7' : (isInitialStage ? '#f1f5f9' : '#fee2e2')}; color: ${isLulusValue ? '#166534' : (isInitialStage ? '#64748b' : '#991b1b')};">${finalStatusLabel}</span></div>
                    </div>
                </div>
                <div style="width: 120px; text-align: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; flex-shrink: 0;">
                    <img src="${qrDataUrl}" style="width: 100px; height: 100px; margin-bottom: 5px; border: 1px solid #cbd5e1; padding: 3px; background: white;">
                    <div style="font-size: 7pt; font-weight: 800; color: #475569; text-transform: uppercase;">SCAN VERIFIKASI</div>
                </div>
            </div>

            ${renderAspectSections(labResults, 'LAB')}
            ${renderAspectSections(fieldResults, 'FIELD')}
            ${renderAspectSections(managementResults, 'MANAG')}

            <div class="score-card" style="margin-top: 20px; page-break-inside: avoid;">
                <div class="score-item">
                    <div class="score-label">Skor Akhir</div>
                    <div class="score-value">${isInitialStage && totalScoreAvg === 0 ? '-' : totalScoreAvg.toFixed(2)}</div>
                </div>
                <div style="width: 1px; height: 30px; background: #10b98133;"></div>
                <div class="score-item">
                    <div class="score-label">Min. Aspek</div>
                    <div class="score-value" style="font-size: 1.6rem; color: ${finalCalc.minAspectScore < 60 && !isInitialStage ? '#ef4444' : '#047857'};">${isInitialStage && finalCalc.minAspectScore === 0 ? '-' : finalCalc.minAspectScore.toFixed(2)}</div>
                </div>
            </div>

            <div class="conclusion" style="margin-top: 15px; page-break-inside: avoid;">
                <strong style="display: block; margin-bottom: 3px; color: #1e293b; font-size: 8pt; text-transform: uppercase;">Catatan Analisa / Rekomendasi:</strong>
                <div style="color: #475569; line-height: 1.3; font-style: italic; margin-bottom: 8px;">${escapeHtml(a.analysis_notes) || 'Berdasarkan hasil pengujian teknis yang telah dilakukan, peralatan ini dinyatakan sesuai dengan spesifikasi teknis yang dipersyaratkan.'}</div>
                ${a.testing_report_ai?.report_ai ? `
                    <div style="margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                        <strong style="display: block; margin-bottom: 3px; color: #1e293b; font-size: 8pt; text-transform: uppercase;">Kesimpulan Analisa Data:</strong>
                        <div style="color: #334155; line-height: 1.3; white-space: pre-wrap; font-family: monospace; font-size: 8pt;">${escapeHtml(a.testing_report_ai.report_ai)}</div>
                    </div>
                ` : ''}
            </div>

            <div class="sign-area">
                <div class="sign-box">
                    <p>Jakarta, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                    <div style="margin-top: 50px; font-weight: 800;">
                        ( ........................................... )
                    </div>
                    <p style="font-size: 7.5pt; color: #64748b; margin-top: 3px; font-weight: 600;">${adminLabel}</p>
                </div>
            </div>

            <div class="footer">
                ${footerText} - Dicetak otomatis oleh sistem
            </div>

            <script>
                window.onload = () => {
                    setTimeout(() => { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

export const printAssetLabel = async (equipmentData, options = {}) => {
    const { 
        appConfig = {}
    } = options;
    
    const headerTitle = appConfig.HEADER_TITLE || "LIMS ASSET";
    const companyName = appConfig.COMPANY_NAME || "LIMS - Asset Management Unit";

    if (!equipmentData) return;
    const items = Array.isArray(equipmentData) ? equipmentData : [equipmentData];
    if (items.length === 0) return;

    // 1. Open window immediately to prevent popup blocker
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    // 2. Show loading message
    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Sedang menyiapkan ${items.length} label...</div></body></html>`);

    try {
        // 3. Generate QR codes for all items in background
        const itemsWithQr = await Promise.all(items.map(async (eq) => {
            const qrUrl = await QRCode.toDataURL(eq.id?.toString() || "N/A", { margin: 1, width: 300 });
            return { ...eq, qrUrl };
        }));

        // 4. Build HTML
        let labelsHTML = '';
        itemsWithQr.forEach((equipment) => {
            labelsHTML += `
                <div class="label-wrapper">
                    <div class="label-container">
                        <div class="qr-section">
                            <img src="${equipment.qrUrl}" class="qr-image" />
                            <div class="asset-id">ID: ${equipment.id}</div>
                        </div>
                        <div class="info-section">
                            <div class="header" style="font-weight: 800; font-size: 11pt; color: #1e3a8a; margin-bottom: 5px; border-bottom: 2px solid #1e3a8a; padding-bottom: 2px;">${headerTitle}</div>
                            <div class="equipment-name" style="font-weight: 800; font-size: 14pt; color: #1e293b; margin-bottom: 5px; line-height: 1.1;">${equipment.equipment_name}</div>
                            <div class="serial-no" style="font-size: 11pt; color: #1e293b; font-weight: 700; margin-bottom: 5px;">S/N: ${equipment.serial_no || '-'}</div>
                            <div style="font-size: 11pt; margin-top: 2px; color: #1e293b; font-weight: 700;">
                                <b>Batch/Kontrak:</b> ${equipment.batch_number}<br>
                                <b>Origin:</b> ${equipment.brand?.origin?.name || equipment.brand?.origin_code || '-'}
                            </div>
                            <div class="footer-text" style="margin-top: auto; font-size: 10pt; color: #1e293b; text-align: right; font-weight: 700;">${companyName}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        // 5. Update window
        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Asset Labels</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
                    body { margin: 0; padding: 0; background: #f1f5f9; }
                    .label-wrapper { 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh;
                        page-break-after: always;
                    }
                    .label-container {
                        width: 100mm;
                        height: 50mm;
                        background: white;
                        border: 1px solid #e2e8f0;
                        padding: 5mm;
                        display: grid;
                        grid-template-columns: 40mm 1fr;
                        gap: 5mm;
                        box-sizing: border-box;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        border-radius: 4px;
                    }
                    .qr-section {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        border-right: 2px dashed #cbd5e1;
                    }
                    .qr-image { width: 35mm; height: 35mm; }
                    .asset-id { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 14pt; margin-top: 2mm; color: #0f172a; }
                    .info-section { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; justify-content: center; }
                    
                    @media print {
                        body { background: white; }
                        .label-wrapper { 
                            display: block; 
                            height: auto; 
                            margin: 0;
                        }
                        .label-container { 
                            box-shadow: none; 
                            border: none;
                            width: 100mm;
                            height: 50mm;
                        }
                        @page { size: 100mm 50mm; margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${labelsHTML}
                <script>
                    window.onload = () => {
                        setTimeout(() => { 
                            window.print(); 
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (err) {
        console.error("Asset print error:", err);
        printWindow.document.write(`<div style="color: red;">Gagal memproses Label. Silakan coba lagi.</div>`);
    }
};

export const printAssetHandover = async (handover, appConfig = {}) => {
    if (!handover || !handover.asset) return;
    
    const headerTitle = appConfig.HEADER_TITLE || "MEC SYSTEM";
    const headerSubtitle = appConfig.COMPANY_NAME || "Laboratory Information Management System";
    const adminName = appConfig.APP_ADMIN_NAME || "Petugas Inventaris";
    const footerText = appConfig.APP_FOOTER || "Dokumen ini adalah bukti serah terima asset yang sah.";

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Memuat Bukti Serah Terima...</div></body></html>`);

    try {
        const qrDataUrl = await QRCode.toDataURL(handover.handover_no || handover.asset.id.toString(), { margin: 1, width: 200 });

        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Bukti Serah Terima - ${handover.handover_no}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 15px; color: #1e293b; line-height: 1.2; font-size: 9pt; margin: 0; }
                    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
                    .logo { width: 45px; height: auto; }
                    .header-text { flex: 1; }
                    h1 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; text-transform: uppercase; }
                    .doc-title { text-align: center; margin: 10px 0; }
                    .doc-title h2 { text-decoration: underline; margin-bottom: 2px; font-size: 1rem; }
                    .info-section { margin-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 4px; margin-bottom: 1px; }
                    .label { font-weight: bold; color: #475569; }
                    .value { color: #0f172a; }
                    .asset-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin: 8px 0; display: flex; justify-content: space-between; }
                    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 25px; }
                    .signature-box { text-align: center; }
                    .signature-line { margin-top: 45px; border-top: 1px solid #000; padding-top: 4px; font-weight: bold; }
                    .qr-container { text-align: center; flex-shrink: 0; margin-left: 10px; }
                    .qr-image { width: 85px; height: 85px; border: 1px solid #cbd5e1; padding: 3px; background: white; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        @page { margin: 8mm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" class="logo">
                    <div class="header-text">
                        <h1>${headerTitle}</h1>
                        <p style="margin: 3px 0; font-weight: 600; color: #64748b; font-size: 8pt;">${headerSubtitle}</p>
                    </div>
                </div>

                <div class="doc-title">
                    <h2 style="margin: 0;">BERITA ACARA SERAH TERIMA ASSET</h2>
                    <p style="margin: 2px 0; font-size: 9pt;">Nomor: ${handover.handover_no}</p>
                </div>

                <p style="margin: 8px 0;">Pada hari ini, <strong>${new Date(handover.handover_date || handover.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, telah dilakukan serah terima asset:</p>

                <div class="asset-box">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: #1e40af; border-bottom: 1px solid #bfdbfe;">Detail Asset</h4>
                        <div class="info-grid"><div class="label">Nama Asset</div><div class="value">: ${handover.asset.equipment_name}</div></div>
                        <div class="info-grid"><div class="label">ID / S/N</div><div class="value">: ${handover.asset.id} / ${handover.asset.serial_no || '-'}</div></div>
                        <div class="info-grid"><div class="label">Kategori</div><div class="value">: ${handover.asset.category?.name || '-'}</div></div>
                        <div class="info-grid"><div class="label">Merk/Model</div><div class="value">: ${handover.asset.brand?.name || '-'} / ${handover.asset.model?.name || '-'}</div></div>
                    </div>
                    <div class="qr-container">
                        <img src="${qrDataUrl}" class="qr-image">
                        <div style="font-size: 7pt; font-weight: 800; color: #64748b; margin-top: 3px;">VERIFIKASI DIGITAL</div>
                    </div>
                </div>

                <div class="info-section">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; border-bottom: 1px solid #bfdbfe;">Penerima</h4>
                    <div class="info-grid"><div class="label">Nama Penerima</div><div class="value">: ${handover.receiver_name || '-'}</div></div>
                    <div class="info-grid"><div class="label">Instansi</div><div class="value">: ${handover.partner?.name || '-'}</div></div>
                    <div class="info-grid"><div class="label">Catatan</div><div class="value">: ${handover.notes || '-'}</div></div>
                </div>

                <p style="margin: 10px 0; font-size: 8.5pt;">Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya.</p>

                <div class="signature-grid">
                    <div class="signature-box">
                        <p style="margin-bottom: 5px;">Pihak Penyerah,</p>
                        <div class="signature-line">( ${handover.created_user || adminName} )</div>
                        <p style="font-size: 7pt; color: #64748b; margin-top: 2px;">${headerTitle}</p>
                    </div>
                    <div class="signature-box">
                        <p style="margin-bottom: 5px;">Pihak Penerima,</p>
                        <div class="signature-line">( ${handover.receiver_name || '............................'} )</div>
                        <p style="font-size: 7pt; color: #64748b; margin-top: 2px;">${handover.partner?.name || 'Penerima'}</p>
                    </div>
                </div>

                <div style="margin-top: 40px; text-align: center; font-size: 7.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    ${footerText}<br>
                    Dicetak pada ${formatIDDate(new Date())}
                </div>

                <script>
                    window.onload = () => { setTimeout(() => { window.print(); }, 500); };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (err) {
        console.error("Handover print error:", err);
        printWindow.document.write(`<div style="color: red;">Gagal memproses dokumen. Silakan coba lagi.</div>`);
    }
};
export const printApplicationHandover = async (a, appConfig = {}) => {
    if (!a || !a.equipment) return;
    
    const headerTitle = appConfig.HEADER_TITLE || "MEC SYSTEM";
    const headerSubtitle = appConfig.COMPANY_NAME || "Laboratory Information Management System";
    const adminName = appConfig.APP_ADMIN_NAME || "Petugas Inventaris";
    const footerText = appConfig.APP_FOOTER || "Dokumen ini adalah bukti serah terima peralatan yang sah.";

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Memuat Bukti Serah Terima...</div></body></html>`);

    try {
        const qrDataUrl = await QRCode.toDataURL(a.reg_number || a.id.toString(), { margin: 1, width: 200 });

        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Bukti Serah Terima - ${a.reg_number}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; line-height: 1.4; font-size: 10pt; margin: 0; }
                    .header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
                    .logo { width: 60px; height: auto; }
                    .header-text { flex: 1; }
                    h1 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #0f172a; text-transform: uppercase; }
                    .doc-title { text-align: center; margin: 20px 0; }
                    .doc-title h2 { text-decoration: underline; margin-bottom: 5px; font-size: 1.2rem; }
                    .info-section { margin-bottom: 15px; }
                    .info-grid { display: grid; grid-template-columns: 180px 1fr; gap: 5px; margin-bottom: 2px; }
                    .label { font-weight: bold; color: #475569; }
                    .value { color: #0f172a; }
                    .asset-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0; display: flex; justify-content: space-between; }
                    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px; }
                    .signature-box { text-align: center; }
                    .signature-line { margin-top: 70px; border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
                    .qr-container { text-align: center; flex-shrink: 0; margin-left: 20px; }
                    .qr-image { width: 100px; height: 100px; border: 1px solid #cbd5e1; padding: 5px; background: white; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        @page { margin: 15mm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" class="logo">
                    <div class="header-text">
                        <h1>${headerTitle}</h1>
                        <p style="margin: 5px 0; font-weight: 600; color: #64748b; font-size: 9pt;">${headerSubtitle}</p>
                    </div>
                </div>

                <div class="doc-title">
                    <h2 style="margin: 0;">BERITA ACARA SERAH TERIMA PERALATAN</h2>
                    <p style="margin: 5px 0; font-size: 10pt;">Nomor: BA/ST/${a.reg_number}</p>
                </div>

                <p style="margin: 15px 0;">Pada hari ini, <strong>${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, telah dilakukan serah terima peralatan hasil pengujian:</p>

                <div class="asset-box">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; color: #1e40af; border-bottom: 1px solid #bfdbfe; font-size: 11pt;">Detail Peralatan</h4>
                        <div class="info-grid"><div class="label">Nama Peralatan</div><div class="value">: ${a.equipment?.equipment_name}</div></div>
                        <div class="info-grid"><div class="label">No. Registrasi</div><div class="value">: ${a.reg_number}</div></div>
                        <div class="info-grid"><div class="label">No. Sertifikat</div><div class="value">: ${a.certificate_num || '-'}</div></div>
                        <div class="info-grid"><div class="label">ID / S/N</div><div class="value">: ${a.id} / ${a.equipment?.serial_no || '-'}</div></div>
                        <div class="info-grid"><div class="label">Kategori</div><div class="value">: ${a.equipment?.category?.name || '-'}</div></div>
                    </div>
                    <div class="qr-container">
                        <img src="${qrDataUrl}" class="qr-image">
                        <div style="font-size: 8pt; font-weight: 800; color: #64748b; margin-top: 5px;">VERIFIKASI DIGITAL</div>
                    </div>
                </div>

                <div class="info-section">
                    <h4 style="margin: 0 0 10px 0; color: #1e40af; border-bottom: 1px solid #bfdbfe; font-size: 11pt;">Penerima</h4>
                    <div class="info-grid"><div class="label">Nama PIC</div><div class="value">: ${a.partner?.pic_name || '-'}</div></div>
                    <div class="info-grid"><div class="label">Instansi</div><div class="value">: ${a.partner?.name || '-'}</div></div>
                    <div class="info-grid"><div class="label">Kesimpulan Uji</div><div class="value">: <strong>${a.final_status || '-'}</strong></div></div>
                </div>

                <p style="margin: 15px 0;">Demikian Berita Acara ini dibuat dalam keadaan baik untuk dipergunakan sebagaimana mestinya.</p>

                <div class="signature-grid">
                    <div class="signature-box">
                        <p style="margin-bottom: 10px;">Pihak Penyerah,</p>
                        <div class="signature-line">( ${adminName} )</div>
                        <p style="font-size: 8pt; color: #64748b; margin-top: 5px;">${headerTitle}</p>
                    </div>
                    <div class="signature-box">
                        <p style="margin-bottom: 10px;">Pihak Penerima,</p>
                        <div class="signature-line">( ${a.partner?.pic_name || '............................'} )</div>
                        <p style="font-size: 8pt; color: #64748b; margin-top: 5px;">${a.partner?.name || 'Penerima'}</p>
                    </div>
                </div>

                <div style="margin-top: 60px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    ${footerText}<br>
                    Dicetak pada ${formatIDDate(new Date())}
                </div>

                <script>
                    window.onload = () => { setTimeout(() => { window.print(); }, 500); };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (err) {
        console.error("Print error:", err);
        printWindow.document.write(`<div style="color: red;">Gagal memproses Bukti Serah Terima.</div>`);
    }
};

export const printReceipt = async (payment, appConfig = {}) => {
    if (!payment || !payment.invoice) return;
    
    const headerTitle = appConfig.HEADER_TITLE || "LIMS";
    const headerSubtitle = appConfig.COMPANY_NAME || "Laboratory Information Management System";
    const adminName = appConfig.APP_ADMIN_NAME || "Bagian Keuangan";
    const footerText = appConfig.APP_FOOTER || "Terima kasih atas pembayaran Anda.";

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak.");
        return;
    }

    printWindow.document.write(`<html><body><div style="font-family: sans-serif; text-align: center; padding-top: 50px;">Memuat Kuitansi...</div></body></html>`);

    try {
        const qrDataUrl = await QRCode.toDataURL(payment.invoice.invoice_number || payment.invoice_id?.toString(), { margin: 1, width: 200 });

        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Kuitansi Pembayaran - ${payment.invoice.invoice_number}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b; line-height: 1.4; font-size: 10pt; }
                    .header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 3px double #e2e8f0; padding-bottom: 15px; }
                    .logo { width: 70px; height: auto; }
                    .header-text { flex: 1; }
                    h1 { color: #0f172a; margin: 0; font-size: 1.4rem; font-weight: 800; }
                    .receipt-title { text-align: center; font-size: 1.6rem; font-weight: 800; margin: 20px 0; text-decoration: underline; color: #1e40af; }
                    .info-grid { display: grid; grid-template-columns: 180px 1fr; gap: 10px; margin-top: 20px; }
                    .label { font-weight: bold; color: #64748b; }
                    .value { color: #1e293b; border-bottom: 1px dotted #cbd5e1; }
                    .amount-box { margin-top: 30px; border: 2px solid #1e40af; padding: 15px; border-radius: 8px; background: #f0f4ff; display: flex; justify-content: space-between; align-items: center; }
                    .amount-text { font-size: 1.4rem; font-weight: 800; color: #1e40af; }
                    .footer { margin-top: 60px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                    .signature-area { margin-top: 40px; display: flex; justify-content: flex-end; }
                    .signature-box { text-align: center; width: 250px; }
                    @media print { 
                        @page { margin: 15mm; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" class="logo">
                    <div class="header-text">
                        <h1>${headerTitle}</h1>
                        <p style="margin: 5px 0; color: #64748b; font-weight: 600;">${headerSubtitle}</p>
                    </div>
                </div>
                
                <div class="receipt-title">KUITANSI PEMBAYARAN</div>
                
                <div class="info-grid">
                    <div class="label">Telah terima dari</div><div class="value">${payment.invoice.application?.partner?.name || '-'}</div>
                    <div class="label">Uang sejumlah</div><div class="value" style="font-style: italic; background: #f8fafc; padding: 5px;"># ${payment.amount?.toLocaleString('id-ID')} Rupiah #</div>
                    <div class="label">Untuk Pembayaran</div><div class="value">Invoice ${payment.invoice.invoice_number} - Layanan Pengujian Peralatan</div>
                    <div class="label">Nomor Registrasi</div><div class="value">${payment.invoice.application?.reg_number || '-'}</div>
                    <div class="label">Metode Pembayaran</div><div class="value">${payment.payment_method || 'Tunai'}</div>
                </div>
                
                <div class="amount-box">
                    <div>
                        <div style="font-size: 0.9rem; font-weight: bold; color: #1e40af; text-transform: uppercase;">Terbilang:</div>
                        <div class="amount-text">Rp ${payment.amount?.toLocaleString('id-ID')} ,-</div>
                    </div>
                    <div style="text-align: center;">
                        <img src="${qrDataUrl}" style="width: 80px; height: 80px; border: 1px solid #cbd5e1; padding: 3px; background: white;">
                        <div style="font-size: 7pt; font-weight: bold; color: #64748b; margin-top: 3px;">VALIDASI DIGITAL</div>
                    </div>
                </div>
                
                <div class="signature-area">
                    <div class="signature-box">
                        <p>Jakarta, ${formatIDDate(payment.payment_date || new Date())}</p>
                        <div style="margin-top: 60px; font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding: 0 20px;">
                            ${payment.created_user || adminName}
                        </div>
                        <p style="margin-top: 5px; color: #64748b; font-size: 0.8rem;">Kasir LIMS</p>
                    </div>
                </div>
                
                <div class="footer">
                    ${footerText}<br>
                    Dokumen ini adalah bukti pembayaran yang sah dan dihasilkan oleh sistem.
                </div>
                <script>
                    window.onload = () => { setTimeout(() => { window.print(); }, 500); };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (err) {
        console.error("Print error:", err);
        printWindow.document.write(`<div style="color: red;">Gagal memproses Kuitansi. Silakan coba lagi.</div>`);
    }
};
