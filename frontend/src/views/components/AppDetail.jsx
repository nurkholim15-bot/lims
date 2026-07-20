import React, { useState, useEffect, useRef } from "react";
import { apiRequest, getDownloadUrl, API_URL } from "@models/api";
import { printTechnicalReport, printRegistrationProof, printAssetLabel, printApplicationHandover } from "@utils/print";
import Modal from "./Modal";
import WebcamModal from "./WebcamModal";
import { cleanParsedValue } from "../../utils/cleanParsedValue";
import { useToast } from '@context/ToastContext';

const safeGetDateString = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  if (d.getFullYear() <= 1970) return "";
  try {
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const safeLocaleDateString = (dateVal) => {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "-";
  if (d.getFullYear() <= 1970) return "-";
  return d.toLocaleDateString("id-ID");
};

const AppDetail = ({ app, stage, onSuccess, onCancel, appConfig = {}, checkPasswordRequirement }) => {
  const { showToast } = useToast();
  const aiOcrEnabled = (appConfig.AI_OCR_ENABLED || "true").toString().trim().toLowerCase() !== "false";
  const aiReportEnabled = (appConfig.AI_REPORT_ENABLED || "true").toString().trim().toLowerCase() !== "false";
  const isToggleEnabled = (appConfig.TOGGLE_SUB_ASPECT_ENABLE || "false").toString().trim().toLowerCase() === "true";

  const [localApp, setLocalApp] = useState(app);
  const [notes, setNotes] = useState(app?.analysis_notes || "");
  const [conclusion, setConclusion] = useState(app?.testing_report_ai?.report_ai || "");
  const [certNum, setCertNum] = useState(app?.certificate_num || "");
  const [certExpiry, setCertExpiry] = useState(app?.expiry_date ? safeGetDateString(app.expiry_date) : "");
  const [submitting, setSubmitting] = useState(false);
  const [executionData, setExecutionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [photos, setPhotos] = useState({});
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const fetchedIdRef = useRef(null);
  const [overrideStatus, setOverrideStatus] = useState("");
  const [dropdownConfig, setDropdownConfig] = useState({});
  const [assetStatuses, setAssetStatuses] = useState([]);
  const [aspectEditing, setAspectEditing] = useState({});
  const [invoice, setInvoice] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamContext, setWebcamContext] = useState({ aspectCode: null, targetParamCode: null });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiReportText, setAiReportText] = useState("");

  useEffect(() => {
    if (!app || fetchedIdRef.current === app.id) return;
    fetchedIdRef.current = app.id;
    fetchAppDetail();
  }, [app?.id]);

  const fetchAppDetail = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/applications/${app.id}`);
      if (data) {
        console.log("AppDetail fetched:", data.id, "Teams:", { lab: data.lab_teams?.length, field: data.field_teams?.length });
        setLocalApp(data);
        const statusUpper = (data.status || "").toUpperCase();
        const hasResults = ["PLANNED", "EXECUTED", "ANALYZED", "REPORTING", "CERTIFIED", "FINALIZED", "CLOSED"].includes(statusUpper);
        if (stage === "testing" || stage === "analysis" || stage === "reporting" || hasResults) {
          await fetchExecution(data);
        }
        setCertNum(data.certificate_num || "");
        setCertExpiry(safeGetDateString(data.expiry_date));
        setNotes(data.analysis_notes || "");
        setConclusion(data.testing_report_ai?.report_ai || "");
      }
    } catch (err) {
      console.error("Fetch app detail error:", err);
    }

    try {
      const invRes = await apiRequest(`/invoices?application_id=${app.id}`);
      if (invRes && invRes.data && invRes.data.length > 0) {
        setInvoice(invRes.data[0]);
      }
    } catch (err) {
      console.warn("Fetch invoice error:", err);
    }

    setLoading(false);
  };

  const fetchExecution = async (currentApp) => {
    try {
      const data = await apiRequest(`/applications/${currentApp.id}/execution`);
      if (data) {
        setExecutionData(data);
        
        // Auto-detect saved aspects from existing scores
        const savedMap = {};
        const allAspectCodes = Array.from(new Set(data.map(r => r.aspect_code)));
        allAspectCodes.forEach(code => {
          const items = data.filter(r => r.aspect_code === code);
          // If all non-empty parameters have actual_value, consider it saved
          const isAllParamFilled = items.length > 0 && items.every(itm => itm.actual_value !== undefined && itm.actual_value !== null && itm.actual_value !== "");
          if (isAllParamFilled) {
             savedMap[code] = true;
          }
        });
        setPersistentSaved(savedMap);

        // OPTIMIZATION: Fetch dropdown config ONLY during active testing stage.
        // During reporting/analysis, we only need to display the raw score.
        if (stage === "testing") {
            const subCodes = Array.from(new Set(data.map(r => r.param_code))).join(",");
            if (subCodes) {
                try {
                    const items = await apiRequest(`/scoring-sub-aspect-items?sub_aspect_codes=${subCodes}`);
                    if (items && Array.isArray(items)) {
                        const mapping = {};
                        items.forEach((itm) => {
                            if (!mapping[itm.sub_aspect_code]) mapping[itm.sub_aspect_code] = [];
                            mapping[itm.sub_aspect_code].push({ label: itm.name, value: itm.score.toString() });
                        });
                        setDropdownConfig(mapping);
                    }
                } catch (err) {
                    console.warn("Targeted dropdown fetch failed:", err);
                }
            }
        }
      }
    } catch (err) {
      console.error("Fetch execution error:", err);
    }
  };

  const fetchAuditHistory = async () => {
    setAuditLoading(true);
    try {
      const data = await apiRequest(`/applications/${app.id}/audit-history`);
      if (data) setAuditHistory(data);
    } catch (err) {
      console.error("Fetch audit history error:", err);
      alert("Gagal memuat riwayat audit");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleShowAuditHistory = () => {
    setShowAuditHistory(true);
    fetchAuditHistory();
  };

  const handleParamChange = (index, field, value) => {
    const newData = [...executionData];
    newData[index][field] = value;
    setExecutionData(newData);
  };

  const handleFileChange = (paramCode, file) => {
    setPhotos({ ...photos, [paramCode]: file });
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file); // Don't compress PDF
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200; // Resize to max 1200px
          if (width > height && width > maxDim) {
            height = Math.round((height *= maxDim / width));
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width *= maxDim / height));
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
              resolve(newFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const processScoringOCR = async (file, aspectCode, targetParamCode = null) => {
    if (!file) return;

    setOcrLoading(targetParamCode || aspectCode || true);
    const processedFile = await compressImage(file);
    const formData = new FormData();
    formData.append("document", processedFile);

    try {
      const res = await apiRequest("/ocr-extract-results", "POST", formData);
      if (res) {
        const newData = [...executionData];
        let updatedCount = 0;

        const resultData = res.data || res;

        // Smart Fallback: if scanning a specific parameter, and no data was found, but raw_text exists
        if (targetParamCode && Object.keys(resultData).length === 0 && res.raw_text) {
          const rawTextClean = res.raw_text.trim();
          const rawMatches = rawTextClean.match(/\b\d+(?:[.,]\d+)?\b/g);
          if (rawMatches && rawMatches.length > 0) {
            const validMatches = rawMatches.filter(n => !/^(19|20)\d{2}$/.test(n));
            if (validMatches.length > 0) {
              resultData[targetParamCode] = validMatches[validMatches.length - 1];
            } else {
              resultData[targetParamCode] = rawMatches[rawMatches.length - 1];
            }
          } else if (rawTextClean.length > 0 && rawTextClean.length < 20) {
            resultData[targetParamCode] = rawTextClean;
          }
        }

        Object.keys(resultData).forEach((subAspectCode) => {
          if (targetParamCode && subAspectCode !== targetParamCode) {
            return;
          }

          const paramIdx = newData.findIndex(
            (p) => p.param_code === subAspectCode || p.sub_aspect_code === subAspectCode
          );

          if (paramIdx !== -1) {
            if (resultData[subAspectCode] !== undefined && resultData[subAspectCode] !== "") {
              const cleaned = cleanParsedValue(resultData[subAspectCode]);
              newData[paramIdx].actual_value = cleaned;
              const numeric = parseFloat(cleaned) || 0;
              newData[paramIdx].score = numeric;
              updatedCount++;
            }
          }
        });

        setExecutionData(newData);
        if (updatedCount > 0) {
          alert(`Berhasil memperbarui ${updatedCount} parameter hasil uji!`);
        } else {
          alert("Tidak ada parameter yang cocok atau bernilai dalam dokumen.");
        }
      }
    } catch (err) {
      console.error("Scoring OCR error:", err);
      showToast("Gagal menjalankan OCR hasil uji: " + err.message, 'error');
    } finally {
      setOcrLoading(null);
    }
  };

  const handleScoringOCR = async (e, aspectCode, targetParamCode = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processScoringOCR(file, aspectCode, targetParamCode);
    e.target.value = "";
  };

  const handleOpenCameraModal = (aspectCode, targetParamCode = null) => {
    setWebcamContext({ aspectCode, targetParamCode });
    setIsWebcamOpen(true);
  };

  const handleCameraCapture = async (file) => {
    const { aspectCode, targetParamCode } = webcamContext;
    await processScoringOCR(file, aspectCode, targetParamCode);
  };

  const handleGenerateAIReport = async () => {
    setAiGenerating(true);
    setAiReportText(""); // Kosongkan teks sebelumnya
    setShowAIModal(true); // Langsung buka modal untuk melihat efek ngetik

    try {
      const token = localStorage.getItem("auth_token");
      const appVersion = import.meta.env.VITE_APP_VERSION || "1.0";
      const appPlatform = (typeof window !== "undefined" && window.Capacitor) ? window.Capacitor.getPlatform() : "Web";
      
      const headers = { 
        "Content-Type": "application/json",
        "X-App-Version": appVersion,
        "X-App-Platform": appPlatform,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/applications/${localApp.id}/generate-report`, {
        method: "POST",
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `API error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let streamedText = "";
      let sectionBText = "";
      let buffer = "";
      let currentEvent = "message";

      const updateUI = () => {
          let finalText = streamedText;
          if (sectionBText) {
              const cIndex = streamedText.indexOf("C. Analisis Deviasi");
              if (cIndex !== -1) {
                  finalText = streamedText.substring(0, cIndex) + "\n" + sectionBText + "\n\n" + streamedText.substring(cIndex);
              } else {
                  finalText = streamedText + "\n\n" + sectionBText;
              }
          }
          setAiReportText(finalText);
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          buffer += chunkStr;
          const lines = buffer.split("\n");
          buffer = lines.pop(); // Simpan baris yang belum selesai ke buffer

          for (const line of lines) {
            if (line.startsWith("event:")) {
                currentEvent = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              let data = line.substring(5).trim(); // Hapus "data:" (5 karakter) dan spasi
              if (data.startsWith(" ")) data = data.substring(1);
              
              if (data === "STREAM_FINISHED") {
                done = true;
                break;
              }
              
              let parsedData = data;
              try {
                const parsed = JSON.parse(data);
                if (parsed && parsed.text !== undefined) {
                  parsedData = parsed.text;
                }
              } catch (e) {
                console.error("Gagal parse JSON dari SSE:", data, e);
              }

              if (currentEvent === "sectionB") {
                  sectionBText += parsedData;
              } else {
                  streamedText += parsedData;
              }
              
              updateUI();
            }
          }
        }
      }
      
      // Jika ada sisa data di buffer setelah stream selesai, proses juga
      if (buffer.startsWith("data:")) {
          let data = buffer.substring(5).trim();
          if (data !== "" && data !== "STREAM_FINISHED") {
              try {
                  const parsed = JSON.parse(data);
                  if (parsed && parsed.text !== undefined) data = parsed.text;
              } catch(e) {}
              if (currentEvent === "sectionB") {
                  sectionBText += data;
              } else {
                  streamedText += data;
              }
              updateUI();
          }
      }
    } catch (err) {
      showToast("Error generate laporan AI: " + err.message, 'error');
      setShowAIModal(false);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAction = async (action, extra) => {
    // Define the actual submission logic
    const performAction = async () => {
      setSubmitting(true);
      try {
        let endpoint = "";
        let method = "PUT";
        let status = "";
        if (action === "REJECT") status = "CANCELED";
        else if (action === "REVISI") status = "Revisi";
        else if (stage === "verification") status = "Verified";
        else if (stage === "approval") status = "Approved";
        else if (stage === "analysis") status = "Analyzed";

        let body;

        if (action === "REVISION") {
          endpoint = `/applications/${localApp.id}/revision`;
          method = "PUT";
          body = { notes: notes };
        } else if (stage === "testing") {

          endpoint = `/applications/${app.id}/execute`;
          const formData = new FormData();
          formData.append("status", "Executed");

          const resultsJson = executionData.map((p) => ({
            param_code: p.param_code,
            score: parseFloat(p.actual_value) || 0,
            notes: p.notes,
            aspect_code: p.aspect_code,
            sub_aspect_code: p.param_code,
            is_disabled: p.is_disabled || false,
          }));
          formData.append("results", JSON.stringify(resultsJson));

          const simLogIds = executionData.filter((p) => p.is_simulator && p.simulator_log_id != null).map((p) => p.simulator_log_id);
          if (simLogIds.length > 0) formData.append("simulator_log_ids", JSON.stringify(simLogIds));

          Object.keys(photos).forEach((pCode) => {
            if (photos[pCode]) formData.append(`photo_${pCode}`, photos[pCode]);
          });
          body = formData;
        } else if (stage === "analysis") {
          endpoint = `/applications/${localApp.id}/analyze`;
          body = { status: "Analyzed", final_score: localApp.final_score || 0, analysis_notes: notes, report_ai: conclusion, final_status: extra };
        } else {
          let payload = { status, is_docs_complete: true };
          if (stage === "verification") {
            endpoint = `/applications/${localApp.id}/verify`;
            payload.verification_notes = notes;
          } else if (stage === "approval") {
            endpoint = `/applications/${localApp.id}/approve`;
            payload.approval_notes = notes;
          } else if (stage === "reporting") {
            endpoint = `/applications/${localApp.id}/finalize`;
            payload.report_ai = conclusion;
            if (action === "FINALIZE_PRINT") {
              payload.status = "Finalized";
              payload.notes = notes || "Sertifikat telah dicetak.";
            } else {
              payload.status = "Certified";
              payload.certificate_num = certNum;
              payload.expiry_date = certExpiry ? new Date(certExpiry) : null;
              payload.notes = notes;
            }
            if (extra) {
              payload.final_status = extra;
            }
          }
          body = payload;
        }

        const res = await apiRequest(endpoint, method, body);
        if (res) onSuccess(stage === "testing" ? "Hasil pengujian disimpan." : "Berhasil.");
      } catch (err) {
        showToast(err.message || "Gagal", 'error');
      } finally {
        setSubmitting(false);
      }
    };

    // Check password requirement and execute
    if (checkPasswordRequirement) {
      // Map stage to path for password checking (e.g., "verification" -> "/verification")
      const stagePath = "/" + stage;
      checkPasswordRequirement(performAction, stagePath);
    } else {
      // Fallback if checkPasswordRequirement not provided
      performAction();
    }
  };

  const safeParsePlans = (plansStr) => {
    console.log("Parsing test_plans:", plansStr);
    try {
      const parsed = typeof plansStr === "string" ? JSON.parse(plansStr) : plansStr || [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Parse error:", e);
      return [];
    }
  };

  const calculateFinalHierarchyScore = (items) => {
    let weightedSum = 0;
    let totalWeight = 0;
    let minAspectScore = 100;
    let allPassed = true;

    const aspectMap = {};
    items.forEach((p) => {
      const key = p.aspect_code || "GENERAL";
      if (!aspectMap[key]) aspectMap[key] = { items: [], weight: p.aspect_weight || p.method_weight || 0 };
      aspectMap[key].items.push(p);
    });

    const groups = Object.values(aspectMap);
    if (groups.length === 0) return { finalScore: 0, minAspectScore: 0, allPassed: false };

    groups.forEach((asp) => {
      const target = localApp || app;
      const aspCode = (asp.items[0]?.aspect_code || "").toString().trim().toUpperCase();
      const persistedAspect = (target.aspect_scores || []).find(s => 
        (s.aspect_code || "").toString().trim().toUpperCase() === aspCode
      );

      let aspScore;
      if (persistedAspect) {
        aspScore = persistedAspect.score;
      } else {
        let subWeighted = 0, subWeight = 0;
        asp.items.forEach((sub) => {
          if (sub.is_disabled) {
            return;
          }
          subWeighted += (parseFloat(sub.actual_value) || 0) * (sub.weight || 0);
          subWeight += sub.weight || 0;
        });
        aspScore = subWeight > 0 ? subWeighted / subWeight : 0;
      }

      weightedSum += aspScore * asp.weight;
      totalWeight += asp.weight;
      if (asp.weight > 0) {
        minAspectScore = Math.min(minAspectScore, aspScore);
        if (aspScore < 60) allPassed = false;
      }
    });

    return {
      finalScore: totalWeight > 0 ? weightedSum / totalWeight : 0,
      minAspectScore: minAspectScore === 100 ? 0 : minAspectScore,
      allPassed: allPassed,
    };
  };

  const getStandardString = (p) => {
    if (!p.standard_value && !p.standard_unit && !p.standard_operator) {
      return "-";
    }
    const op = p.standard_operator || ">=";
    if (op.toLowerCase() === "range") {
      return `${p.standard_value} s.d ${p.standard_value_max} ${p.standard_unit || ""}`;
    }
    return `${op} ${p.standard_value} ${p.standard_unit || ""}`;
  };

  const getPercentString = (actualValue, p) => {
    const val = parseFloat(actualValue);
    if (isNaN(val) || !actualValue || actualValue === "") return "-";
    if (!p.standard_value && !p.standard_unit) return "-";
    
    const op = (p.standard_operator || "").trim().toLowerCase();
    if (op === "range") return "-";
    if (op === "<=" || op === "<") {
      if (val > 0) return ((p.standard_value / val) * 100).toFixed(1) + "%";
      return "100.0%";
    }
    if (p.standard_value > 0) {
      return ((val / p.standard_value) * 100).toFixed(1) + "%";
    }
    return "-";
  };

  const getKeterangan = (actualValue, p) => {
    const val = parseFloat(actualValue);
    if (isNaN(val) || !actualValue || actualValue === "") return "-";
    if (!p.standard_value && !p.standard_unit) return "-";

    const op = (p.standard_operator || "").trim().toLowerCase();
    let isPassed = false;
    if (op === "range") {
      isPassed = val >= p.standard_value && val <= p.standard_value_max;
    } else if (op === "<=") {
      isPassed = val <= p.standard_value;
    } else if (op === "<") {
      isPassed = val < p.standard_value;
    } else if (op === ">") {
      isPassed = val > p.standard_value;
    } else if (op === "=") {
      isPassed = val === p.standard_value;
    } else { // default >=
      isPassed = val >= p.standard_value;
    }

    return isPassed ? (
      <span style={{ color: "#10b981", fontWeight: 700 }}>Memenuhi</span>
    ) : (
      <span style={{ color: "#ef4444", fontWeight: 700 }}>Tidak Memenuhi</span>
    );
  };

  const renderAnalysisGroup = (title, items, icon, color, bg) => {
    if (!items || items.length === 0) return null;
    const aspectMap = {};
    items.forEach((p) => {
      const key = p.aspect_code || "GENERAL";
      if (!aspectMap[key]) aspectMap[key] = { code: key, name: p.aspect_name || p.method_name || "Lainnya", weight: p.aspect_weight || 0, items: [] };
      aspectMap[key].items.push(p);
    });

    const sortedAspectGroups = Object.values(aspectMap).sort((a, b) => a.code.localeCompare(b.code));
    sortedAspectGroups.forEach((asp) => {
      asp.items.sort((a, b) => (a.param_code || "").localeCompare(b.param_code || ""));
    });

    return (
      <div style={{ marginBottom: "1.25rem" }}>
        <h5 style={{ marginBottom: "0.75rem", color, display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.95rem" }}>
          <i className={icon}></i> {title}
        </h5>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sortedAspectGroups.map((asp) => {
            const target = localApp || app;
            const aspCodeRaw = (asp.code || "").toString().trim().toUpperCase();
            
            // PRIORITY: Ambil dari tabel testing_aspect_scores (Manual/Cached)
            const persistedAspect = (target.aspect_scores || []).find(s => 
              (s.aspect_code || "").toString().trim().toUpperCase() === aspCodeRaw
            );

            const isPreExecution = ["REGISTERED", "VERIFIED", "APPROVED", "PLANNED", "REVISI"].includes((target.status || "").toUpperCase());
            let aspScore;
            if (persistedAspect) {
              aspScore = persistedAspect.score;
            } else if (isPreExecution) {
              aspScore = 0;
            } else {
              let subWeightedSum = 0, subTotalWeight = 0;
              asp.items.forEach((sub) => {
                if (sub.is_disabled) {
                  return;
                }
                const score = parseFloat(sub.actual_value) || 0;
                subWeightedSum += score * (sub.weight || 0);
                subTotalWeight += sub.weight || 0;
              });
              aspScore = subTotalWeight > 0 ? subWeightedSum / subTotalWeight : 0;
            }
            // 1. LIHAT DI TABEL RELASIONAL TERSTRUKTUR
            const structuredPlan = (target.testing_plans || []).find((p) => {
              const dbCode = (p.aspect_code || "").toString().trim().toUpperCase();
              const aspCode = (asp.code || "").toString().trim().toUpperCase();
              return dbCode === aspCode && dbCode !== "";
            });

            // AGGRESSIVE FALLBACK
            const isLab = ["LAB", "LABORATORIUM"].includes((asp.methodology?.test_type_code || "").toUpperCase());
            const isField = ["FLD", "FIELD", "LAPANGAN"].includes((asp.methodology?.test_type_code || "").toUpperCase());

            // GABUNGKAN DATA (Utamakan dari tester_applications relasional)
            const allTeams = target.tester_applications || [];
            console.log(`DEBUG: AppID ${target.id} Aspect ${asp.code} - total teams: ${allTeams.length}`);
            let filteredTeams = allTeams.filter((t) => {
              const dbCode = (t.aspect_code || "").toString().trim().toUpperCase();
              const aspCode = (asp.code || "").toString().trim().toUpperCase();
              const match = dbCode === aspCode && dbCode !== "";
              if (match) console.log(`DEBUG: Matched Team Member: ${t.tester?.name || t.tester_id}`);
              return match;
            });

            let teamNames = filteredTeams.map((t) => t.tester?.name || t.tester_id).join(", ");

            // Jika tim per aspek kosong, ambil dari Global Team
            if (!teamNames || teamNames === "" || teamNames === "-") {
              const labTeamsStr = target.lab_teams?.map((t) => t.tester?.name || t.tester_id).join(", ");
              const fieldTeamsStr = target.field_teams?.map((t) => t.tester?.name || t.tester_id).join(", ");
              teamNames = (isLab ? labTeamsStr : isField ? fieldTeamsStr : labTeamsStr || fieldTeamsStr) || "-";
            }

            let locDisp = structuredPlan?.location?.name || structuredPlan?.location_code || "-";
            let dateDisp = structuredPlan?.scheduled_date ? safeLocaleDateString(structuredPlan.scheduled_date) : "-";

            return (
              <div key={asp.code} className="card" style={{ border: `1px solid ${color}22`, padding: 0, overflow: "hidden", borderRadius: "10px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <div style={{ background: bg || `${color}05`, padding: "0.6rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${color}15` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ background: `${color}15`, color, padding: "2px 8px", borderRadius: "5px", fontSize: "0.65rem", fontWeight: 800 }}>{asp.code}</span>
                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{asp.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Bobot: {asp.weight}%</span>
                    <div style={{ background: color, color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 800 }}>Skor: {isPreExecution && !persistedAspect ? "-" : aspScore.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ padding: "0.75rem 1rem", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700 }}>LOKASI PENGUJIAN</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
                       <i className="fas fa-map-marker-alt"></i> {locDisp || "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700 }}>JADWAL PELAKSANAAN</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
                       <i className="fas fa-calendar-alt"></i> {dateDisp || "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700 }}>TIM PENGUJI</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
                       <i className="fas fa-users"></i> {teamNames || "-"}
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="small-table" style={{ border: "none", margin: 0 }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th style={{ paddingLeft: "1rem" }}>Sub-Aspek / Parameter</th>
                        <th style={{ textAlign: "center", width: "80px" }}>Skor</th>
                        <th style={{ textAlign: "center", width: "70px" }}>Bobot</th>
                        <th style={{ textAlign: "center", width: "80px" }}>Hasil</th>
                        <th style={{ textAlign: "center", width: "120px" }}>Standar</th>
                        <th style={{ textAlign: "center", width: "90px" }}>% Hasil</th>
                        <th style={{ textAlign: "center", width: "140px" }}>Keterangan</th>
                        <th style={{ textAlign: "center", paddingRight: "1rem", width: "50px" }}>Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                       {asp.items.map((res, i) => {
                        const isParamDisabled = res.is_disabled === true;
                        const actualVal = isPreExecution || isParamDisabled ? 0 : (parseFloat(res.actual_value) || 0);
                        const subWeight = res.weight || 0;
                        const hasil = (actualVal * subWeight) / 100;
                        return (
                          <tr key={res.param_code || i} style={isParamDisabled ? { opacity: 0.6, background: "#f8fafc" } : {}}>
                            <td style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
                              <div style={{ fontWeight: 600, color: "#334155" }}>
                                {res.param_code && <span style={{ color: "#94a3b8", marginRight: "0.5rem", fontWeight: 700 }}>{res.param_code}</span>}
                                {res.parameter_name} {isParamDisabled && <span style={{ color: "#ef4444", marginLeft: "0.5rem", fontWeight: "bold" }}>(NON-AKTIF)</span>} {res.notes && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.5rem" }}>• {res.notes}</span>}
                              </div>
                            </td>
                            <td style={{ textAlign: "center", fontWeight: 600, fontSize: "0.8rem" }}>{isParamDisabled ? "N/A" : (actualVal === 0 && isPreExecution ? "-" : actualVal)}</td>
                            <td style={{ textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>{res.weight}%</td>
                            <td style={{ textAlign: "center", fontWeight: 700, color: "#1e293b", fontSize: "0.8rem" }}>{isParamDisabled ? "N/A" : (hasil === 0 && isPreExecution ? "-" : hasil.toFixed(2))}</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 600 }}>{isPreExecution || isParamDisabled ? "-" : getStandardString(res)}</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem", color: "#475569" }}>{isPreExecution || isParamDisabled ? "-" : getPercentString(res.actual_value, res)}</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem" }}>{isPreExecution || isParamDisabled ? "-" : getKeterangan(res.actual_value, res)}</td>
                            <td style={{ textAlign: "center", paddingRight: "1rem" }}>{res.photo_path ? <i className="fas fa-image" style={{ color: "#10b981", fontSize: "0.8rem" }}></i> : "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [aspectSaving, setAspectSaving] = useState({});
  const [aspectSaved, setAspectSaved] = useState({});
  const [persistentSaved, setPersistentSaved] = useState({}); // Tracking aspects saved in session
  const [anomalyBlock, setAnomalyBlock] = useState(null);
  const [overrideReasonInput, setOverrideReasonInput] = useState("");
  const [anomalySubNotes, setAnomalySubNotes] = useState({});

  const handleCancelAnomalyModal = () => {
    setAnomalyBlock(null);
    setOverrideReasonInput("");
    setAnomalySubNotes({});
    fetchExecution(localApp || app);
  };

  const handleSaveAspect = async (aspectCode, aspectItems, isReady, override = false, overrideReason = "", spvUser = "", spvPass = "") => {
    // Robust check for ENABLE_ASSET_CHECKING
    const configVal = (appConfig.ENABLE_ASSET_CHECKING || "true").toString().trim().toLowerCase();
    const isCheckingEnabled = configVal !== "false";
    
    // Logic: If checking is enabled, not ready, and not already saved successfully once
    if (isCheckingEnabled && !isReady && !persistentSaved[aspectCode]) {
      alert("⚠️ Validasi Gagal: Lokasi asset berbeda dari lokasi pengujian atau asset belum berstatus Check-In. Harap sesuaikan lokasi asset atau lakukan Check-in terlebih dahulu.");
      return;
    }

    setAspectSaving((prev) => ({ ...prev, [aspectCode]: true }));
    try {
      const formData = new FormData();
      const resultsJson = aspectItems.map((p) => ({
        param_code: p.param_code,
        score: parseFloat(p.actual_value) || 0,
        notes: p.notes || "",
        aspect_code: p.aspect_code,
        sub_aspect_code: p.sub_aspect_code,
        is_disabled: p.is_disabled || false,
      }));
      formData.append("results", JSON.stringify(resultsJson));
      aspectItems.forEach((p) => {
        if (photos[p.param_code]) formData.append(`photo_${p.param_code}`, photos[p.param_code]);
      });
      
      if (override) {
        formData.append("override", "true");
        formData.append("override_reason", overrideReason);
        formData.append("spv_username", spvUser);
        formData.append("spv_password", spvPass);
      }

      const res = await apiRequest(`/applications/${localApp.id}/execute-aspect/${aspectCode}`, "PUT", formData);
      if (res) {
        setAspectSaved((prev) => ({ ...prev, [aspectCode]: true }));
        setPersistentSaved((prev) => ({ ...prev, [aspectCode]: true }));
        setAspectEditing((prev) => ({ ...prev, [aspectCode]: false }));
        setAnomalyBlock(null);
        setOverrideReasonInput("");
        setAnomalySubNotes({});
        setTimeout(() => setAspectSaved((prev) => ({ ...prev, [aspectCode]: false })), 3000);
      }
    } catch (err) {
      const isBlocked = (err.response && err.response.status === "BLOCKED") || 
                        (err.status === "BLOCKED") ||
                        (err.message && err.message.includes("Deteksi Anomali"));
      
      if (isBlocked) {
        setAnomalyBlock({
          aspectCode,
          aspectItems,
          isReady,
          anomalyScore: err.response?.anomaly_score || err.anomaly_score || 0.6319,
          shapValues: err.response?.shap_values || err.shap_values || {
            "KESEN": 36.70,
            "KELCH": 32.16,
            "KEDAI": 31.14
          },
          medians: err.response?.medians || err.medians || {},
          stds: err.response?.stds || err.stds || {},
          message: err.response?.message || err.message
        });
      } else {
        showToast(err.message || "Gagal", 'error');
      }
    } finally {
      setAspectSaving((prev) => ({ ...prev, [aspectCode]: false }));
    }
  };

  const renderAspectGroups = (title, items, icon, color, bgColor) => {
    if (items.length === 0) return null;

    // KONFIGURASI DROPDOWN KHUSUS BERDASARKAN SUB-ASPECT CODE
    // Data ini sekarang diambil secara dinamis dari master data
    const DROPDOWN_CONFIG = dropdownConfig;

    const aspectMap = {};
    items.forEach((p) => {
      const key = p.aspect_code || "GENERAL";
      if (!aspectMap[key]) aspectMap[key] = { code: key, name: p.aspect_name || key, items: [] };
      aspectMap[key].items.push(p);
    });

    const sortedAspectGroups = Object.values(aspectMap).sort((a, b) => a.code.localeCompare(b.code));
    sortedAspectGroups.forEach((group) => {
      group.items.sort((a, b) => (a.param_code || "").localeCompare(b.param_code || ""));
    });

    return (
      <div style={{ marginBottom: "2rem" }}>
        <h4 style={{ marginBottom: "1.5rem", color, display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
          <i className={icon}></i> {title}
          <span style={{ fontSize: "0.75rem", background: `${color}18`, color, padding: "2px 10px", borderRadius: "12px", marginLeft: "10px" }}>{sortedAspectGroups.length} Aspek</span>
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: window.innerWidth < 1024 ? "800px" : "auto" }}>
          {sortedAspectGroups.map((group) => {

            const filledCount = group.items.filter((p) => p.actual_value && p.actual_value !== "").length;
            const totalCount = group.items.length;
            const progress = Math.round((filledCount / totalCount) * 100);
            const target = localApp || app;
            const testTypeCode = group.items?.[0]?.test_type_code || "";
            const isLab = ["LAB", "LABORATORIUM"].includes(testTypeCode.toUpperCase());
            const isField = ["FLD", "FIELD", "LAPANGAN"].includes(testTypeCode.toUpperCase());

            // 1. LIHAT DI TABEL RELASIONAL TERSTRUKTUR (TERBARU)
            const structuredPlan = (target.testing_plans || []).find((p) => {
              const dbCode = (p.aspect_code || "").toString().trim().toUpperCase();
              const groupCode = (group.code || "").toString().trim().toUpperCase();
              return dbCode === groupCode && dbCode !== "";
            });

            // GABUNGKAN DATA (Utamakan dari tester_applications relasional)
            let teamNames = (target.tester_applications || [])
              .filter((t) => {
                const dbCode = (t.aspect_code || "").toString().trim().toUpperCase();
                const groupCode = (group.code || "").toString().trim().toUpperCase();
                return dbCode === groupCode && dbCode !== "";
              })
              .map((t) => t.tester?.name || t.tester_id)
              .join(", ");

            if (!teamNames || teamNames === "" || teamNames === "-") {
              const labTeamsStr = target.lab_teams?.map((t) => t.tester?.name || t.tester_id).join(", ");
              const fieldTeamsStr = target.field_teams?.map((t) => t.tester?.name || t.tester_id).join(", ");
              teamNames = (isLab ? labTeamsStr : isField ? fieldTeamsStr : labTeamsStr || fieldTeamsStr) || "-";
            }

            let locDisp = structuredPlan?.location?.name || structuredPlan?.location_code || "-";
            let targetLocForAspectCode = structuredPlan?.location_code || "";
            let dateDisp = structuredPlan?.scheduled_date ? safeLocaleDateString(structuredPlan.scheduled_date) : "-";

            const checkinCode = (appConfig.ASSET_STATUS_CHECKIN || "CEKIN").toString().trim().toUpperCase();
            const targetLocForAspect = (targetLocForAspectCode || "").toString().trim().toUpperCase();
            
            const assetLoc = (localApp.equipment?.asset_location_code || "").toString().trim().toUpperCase();
            const assetStatus = (localApp.equipment?.asset_status_code || "").toString().trim().toUpperCase();
            
            // Perbaikan Multi-Lokasi: Cocokkan kode lokasi aset dengan kode lokasi target aspek ini
            const isReady = assetLoc === targetLocForAspect && assetStatus === checkinCode;
            
            const configVal = (appConfig.ENABLE_ASSET_CHECKING || "true").toString().trim().toLowerCase();
            const isCheckingEnabled = configVal !== "false";
            const isSaved = aspectSaved[group.code] || persistentSaved[group.code];
            const isActuallyDisabled = aspectSaving[group.code];
            const isEditing = aspectEditing[group.code];
            
            // If checking is enabled, fields are disabled UNLESS we are in editing mode or not saved yet.
            // However, we allow interaction if isEditing is true.
            const isInteractionDisabled = (isSaved && !isEditing) || isActuallyDisabled;

            console.log(`Aspect ${group.code} Status:`, { isReady, isSaved, isEditing, assetLoc, targetLocForAspect });

            if (group.code === "PEANT") {
              console.log("Debug PEANT:", { assetLoc, targetLocForAspect, assetStatus, checkinCode, isReady });
            }

            return (
              <div key={group.code} style={{ border: `1px solid ${color}33`, borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ background: bgColor || `${color}08`, padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ background: `${color}20`, color, padding: "3px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>{group.code}</span>
                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem" }}>{group.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
                    {!isInteractionDisabled && aiOcrEnabled && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ position: "relative", overflow: "hidden", display: "inline-block" }}>
                          <button 
                            type="button"
                            disabled={(ocrLoading === group.code || ocrLoading === true)}
                            style={{ border: "1px solid #cbd5e1", background: (ocrLoading === group.code || ocrLoading === true) ? "#f1f5f9" : "white", color: (ocrLoading === group.code || ocrLoading === true) ? "#94a3b8" : "#0284c7", cursor: (ocrLoading === group.code || ocrLoading === true) ? "not-allowed" : "pointer", fontSize: "0.8rem", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
                          >
                            <i className={(ocrLoading === group.code || ocrLoading === true) ? "fas fa-spinner fa-spin" : "fas fa-file-upload"}></i> {(ocrLoading === group.code || ocrLoading === true) ? "Sedang proses..." : "Auto-fill OCR (File)"}
                          </button>
                          {!(ocrLoading === group.code || ocrLoading === true) && (
                            <input 
                              type="file" 
                              accept="image/*,.pdf,.txt,.csv,.log"
                              onChange={(e) => handleScoringOCR(e, group.code)}
                              style={{ position: "absolute", left: 0, top: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                            />
                          )}
                        </div>

                        <button 
                          type="button"
                          disabled={(ocrLoading === group.code || ocrLoading === true)}
                          onClick={() => handleOpenCameraModal(group.code)}
                          style={{ border: "1px solid #cbd5e1", background: (ocrLoading === group.code || ocrLoading === true) ? "#f1f5f9" : "white", color: (ocrLoading === group.code || ocrLoading === true) ? "#94a3b8" : "#0284c7", cursor: (ocrLoading === group.code || ocrLoading === true) ? "not-allowed" : "pointer", fontSize: "0.8rem", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                          <i className="fas fa-camera"></i> {(ocrLoading === group.code || ocrLoading === true) ? "Sedang proses..." : "Auto-fill OCR (Kamera)"}
                        </button>
                      </div>
                    )}

                    {isSaved && !isEditing && (
                      <button 
                        onClick={() => setAspectEditing(prev => ({...prev, [group.code]: true}))}
                        style={{ border: "1px solid #cbd5e1", background: "white", color: "#64748b", cursor: "pointer", fontSize: "0.8rem", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
                      >
                        <i className="fas fa-edit"></i> Ubah Nilai
                      </button>
                    )}

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>PROGRESS</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>{progress}%</div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isReady && isCheckingEnabled) {
                          alert(`⚠️ Tidak bisa menyimpan: Lokasi (${assetLoc} vs ${targetLocForAspect}) atau Status (${assetStatus} vs ${checkinCode}) asset belum sesuai.`);
                          return;
                        }
                        handleSaveAspect(group.code, group.items, isReady);
                      }}
                      title={(!isReady && isCheckingEnabled) ? `Lokasi asset (${assetLoc}) tidak sesuai dengan target (${targetLocForAspect}) atau status bukan ${checkinCode}` : ""}
                      disabled={isActuallyDisabled || (isSaved && !isActuallyDisabled && !isEditing)}
                      style={{ 
                        background: (isSaved && !isEditing) ? "#10b981" : (!isReady && isCheckingEnabled) ? "#f1f5f9" : color, 
                        color: (!isReady && isCheckingEnabled && !isSaved) ? "#64748b" : "white", 
                        border: (!isReady && isCheckingEnabled && !isSaved) ? `1px dashed ${color}` : "none", 
                        borderRadius: "8px", 
                        padding: "8px 16px", fontSize: "0.8rem", fontWeight: 700, 
                        cursor: (!isReady && isCheckingEnabled) ? "not-allowed" : isActuallyDisabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {isActuallyDisabled ? "Saving..." : (isSaved && !isEditing) ? "Saved" : isEditing ? "Update Aspect" : "Save Aspect"}
                    </button>
                    {(!isReady && isCheckingEnabled) && (
                      <div style={{ position: "absolute", bottom: "-20px", right: "0", fontSize: "0.6rem", color: "#ef4444", fontWeight: 700, whiteSpace: "nowrap" }}>
                        <i className="fas fa-exclamation-triangle"></i> Lokasi/Status Aset Belum Sesuai
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: "1rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>LOKASI PENGUJIAN</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                      <i className="fas fa-map-marker-alt"></i> {locDisp || "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>JADWAL PELAKSANAAN</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                      <i className="fas fa-calendar-alt"></i> {dateDisp || "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>TIM PENGUJI</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                      <i className="fas fa-users"></i> {teamNames || "-"}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table className="small-table" style={{ margin: 0, border: "none", minWidth: "850px" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th style={{ paddingLeft: "1.25rem" }}>Parameter</th>
                        <th style={{ width: "220px", textAlign: "center" }}>Nilai</th>
                        <th style={{ width: "80px", textAlign: "center" }}>Bobot</th>
                        <th style={{ width: "120px", textAlign: "center" }}>Standar</th>
                        <th style={{ width: "90px", textAlign: "center" }}>% Hasil</th>
                        <th style={{ width: "140px", textAlign: "center" }}>Keterangan</th>
                        <th style={{ width: "140px", textAlign: "center" }}>Foto</th>
                        <th>Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((p) => {
                        const idx = executionData.findIndex((item) => item.param_code === p.param_code);
                        const isParamDisabled = idx !== -1 ? executionData[idx]?.is_disabled === true : false;
                        const isSim = p.is_simulator === true;
                        const isFieldDisabled = isSim || isInteractionDisabled || isParamDisabled;

                        return (
                          <tr key={p.param_code} style={isParamDisabled ? { opacity: 0.6, background: "#f8fafc" } : {}}>
                            <td style={{ paddingLeft: "1.25rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {isToggleEnabled && (
                                  <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#64748b", cursor: "pointer", userSelect: "none", marginRight: "8px" }}>
                                    <input
                                      type="checkbox"
                                      checked={!isParamDisabled}
                                      onChange={(e) => handleParamChange(idx, "is_disabled", e.target.checked ? false : true)}
                                      disabled={isInteractionDisabled}
                                    />
                                    <span style={{ fontWeight: 600 }}>Aktif</span>
                                  </label>
                                )}
                                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                  {p.param_code && <span style={{ color: "#94a3b8", marginRight: "0.5rem", fontWeight: 700 }}>{p.param_code}</span>}
                                  {p.parameter_name} {isSim && <span className="badge badge-info">SIM</span>}
                                </div>
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Bobot: {p.weight}%</div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {dropdownConfig[p.param_code] && dropdownConfig[p.param_code].length > 0 ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%" }}>
                                  <select
                                    value={p.actual_value || ""}
                                    onChange={(e) => !isFieldDisabled && handleParamChange(idx, "actual_value", e.target.value)}
                                    disabled={isFieldDisabled}
                                    style={{ flex: 1, textAlign: "left", background: isFieldDisabled ? "#f1f5f9" : "white", padding: "6px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                                  >
                                    <option value="">-- Pilih --</option>
                                    {dropdownConfig[p.param_code].map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  {p.actual_value !== undefined && p.actual_value !== null && p.actual_value !== "" && <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginRight: "4px" }}>{p.actual_value}</div>}
                                  {!isFieldDisabled && aiOcrEnabled && (
                                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                      <div style={{ position: "relative", overflow: "hidden", display: "inline-block" }}>
                                        <button
                                          type="button"
                                          disabled={(ocrLoading === p.param_code || ocrLoading === true)}
                                          title="Upload File OCR parameter ini saja"
                                          style={{ background: (ocrLoading === p.param_code || ocrLoading === true) ? "#f1f5f9" : "#f0fdf4", color: (ocrLoading === p.param_code || ocrLoading === true) ? "#94a3b8" : "#166534", border: (ocrLoading === p.param_code || ocrLoading === true) ? "1px solid #cbd5e1" : "1px solid #bbf7d0", borderRadius: "6px", cursor: (ocrLoading === p.param_code || ocrLoading === true) ? "not-allowed" : "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                          <i className={(ocrLoading === p.param_code || ocrLoading === true) ? "fas fa-spinner fa-spin" : "fas fa-file-upload"} style={{ fontSize: "0.75rem" }}></i>
                                        </button>
                                        {!(ocrLoading === p.param_code || ocrLoading === true) && (
                                          <input 
                                            type="file" 
                                            accept="image/*,.pdf,.txt,.csv,.log"
                                            onChange={(e) => handleScoringOCR(e, group.code, p.param_code)}
                                            style={{ position: "absolute", left: 0, top: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                                          />
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        disabled={(ocrLoading === p.param_code || ocrLoading === true)}
                                        onClick={() => handleOpenCameraModal(group.code, p.param_code)}
                                        title="Ambil Foto OCR parameter ini saja"
                                        style={{ background: (ocrLoading === p.param_code || ocrLoading === true) ? "#f1f5f9" : "#f0fdf4", color: (ocrLoading === p.param_code || ocrLoading === true) ? "#94a3b8" : "#166534", border: (ocrLoading === p.param_code || ocrLoading === true) ? "1px solid #cbd5e1" : "1px solid #bbf7d0", borderRadius: "6px", cursor: (ocrLoading === p.param_code || ocrLoading === true) ? "not-allowed" : "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <i className={(ocrLoading === p.param_code || ocrLoading === true) ? "fas fa-spinner fa-spin" : "fas fa-camera"} style={{ fontSize: "0.75rem" }}></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%" }}>
                                  <input
                                    type="number"
                                    value={p.actual_value || ""}
                                    onChange={(e) => !isFieldDisabled && handleParamChange(idx, "actual_value", e.target.value)}
                                    readOnly={isFieldDisabled}
                                    disabled={isFieldDisabled}
                                    style={{ flex: 1, textAlign: "center", background: isFieldDisabled ? "#f1f5f9" : "white" }}
                                  />
                                  {!isFieldDisabled && aiOcrEnabled && (
                                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                      <div style={{ position: "relative", overflow: "hidden", display: "inline-block" }}>
                                        <button
                                          type="button"
                                          disabled={(ocrLoading === p.param_code || ocrLoading === true)}
                                          title="Upload File OCR parameter ini saja"
                                          style={{ background: (ocrLoading === p.param_code || ocrLoading === true) ? "#f1f5f9" : "#f0fdf4", color: (ocrLoading === p.param_code || ocrLoading === true) ? "#94a3b8" : "#166534", border: (ocrLoading === p.param_code || ocrLoading === true) ? "1px solid #cbd5e1" : "1px solid #bbf7d0", borderRadius: "6px", cursor: (ocrLoading === p.param_code || ocrLoading === true) ? "not-allowed" : "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                          <i className={(ocrLoading === p.param_code || ocrLoading === true) ? "fas fa-spinner fa-spin" : "fas fa-file-upload"} style={{ fontSize: "0.75rem" }}></i>
                                        </button>
                                        {!(ocrLoading === p.param_code || ocrLoading === true) && (
                                          <input 
                                            type="file" 
                                            accept="image/*,.pdf,.txt,.csv,.log"
                                            onChange={(e) => handleScoringOCR(e, group.code, p.param_code)}
                                            style={{ position: "absolute", left: 0, top: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                                          />
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        disabled={(ocrLoading === p.param_code || ocrLoading === true)}
                                        onClick={() => handleOpenCameraModal(group.code, p.param_code)}
                                        title="Ambil Foto OCR parameter ini saja"
                                        style={{ background: (ocrLoading === p.param_code || ocrLoading === true) ? "#f1f5f9" : "#f0fdf4", color: (ocrLoading === p.param_code || ocrLoading === true) ? "#94a3b8" : "#166534", border: (ocrLoading === p.param_code || ocrLoading === true) ? "1px solid #cbd5e1" : "1px solid #bbf7d0", borderRadius: "6px", cursor: (ocrLoading === p.param_code || ocrLoading === true) ? "not-allowed" : "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <i className={(ocrLoading === p.param_code || ocrLoading === true) ? "fas fa-spinner fa-spin" : "fas fa-camera"} style={{ fontSize: "0.75rem" }}></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem" }}>{p.weight}%</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 600 }}>{getStandardString(p)}</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem", color: "#475569" }}>{getPercentString(p.actual_value, p)}</td>
                            <td style={{ textAlign: "center", fontSize: "0.8rem" }}>{getKeterangan(p.actual_value, p)}</td>
                            <td>{!isFieldDisabled && <input type="file" onChange={(e) => handleFileChange(p.param_code, e.target.files[0])} style={{ fontSize: "10px" }} />}</td>
                            <td>
                              <input type="text" value={p.notes || ""} onChange={(e) => !isFieldDisabled && handleParamChange(idx, "notes", e.target.value)} readOnly={isFieldDisabled} disabled={isFieldDisabled} style={{ width: "100%", fontSize: "0.85rem", background: isFieldDisabled ? "#f1f5f9" : "white" }} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleAssetCheckIn = async () => {
    try {
      const targetLoc = localApp.lab_location_code || localApp.field_location_code;
      if (!targetLoc) {
        alert("Lokasi pengujian belum ditentukan.");
        return;
      }
      const checkinStatus = appConfig.ASSET_STATUS_CHECKIN || "2";
      const res = await apiRequest("/asset-activity", "POST", {
        equipment_id: localApp.equipment?.id,
        activity_type: "CEKIN",
        to_location: targetLoc,
        to_status: checkinStatus,
        notes: "Check-in otomatis saat pelaksanaan pengujian."
      });
      if (res.message) {
        showToast("Asset berhasil di Check-in ke lokasi pengujian.", 'success');
        fetchAppDetail();
      }
    } catch (err) {
      showToast("Gagal check-in asset: " + err.message, 'error');
    }
  };

  const renderAssetCheckSection = () => {
    const configVal = (appConfig.ENABLE_ASSET_CHECKING || "true").toString().trim().toLowerCase();
    if (configVal === "false") return null;

    const equip = localApp.equipment;
    if (!equip) return null;

    const checkinStatus = (appConfig.ASSET_STATUS_CHECKIN || "CEKIN").toString().trim().toUpperCase();
    const currentLoc = (equip.asset_location_code || "").toString().trim().toUpperCase();
    const currentStatus = (equip.asset_status_code || "").toString().trim().toUpperCase();
    
    // Asset Status name is now taken directly from the preloaded data structure
    const resolvedStatusName = equip.asset_status?.asset_status_name || currentStatus;

    // Untuk header, ambil semua lokasi yang dibutuhkan oleh aplikasi ini (bisa multi)
    const requiredLocations = (localApp.testing_plans || []).map(p => (p.location_code || "").toUpperCase());
    
    const testLocRaw = requiredLocations.length > 0 ? requiredLocations[0] : "";
    const testLoc = (testLocRaw || "").toString().trim().toUpperCase();
    const targetLocName = (localApp.testing_plans?.length > 0 && localApp.testing_plans[0].location?.name) || testLocRaw;
    
    const isMatchingLoc = currentLoc === testLoc || requiredLocations.includes(currentLoc);
    const isCheckedIn = currentStatus === checkinStatus || currentStatus === "2" || (currentStatus === "CEKIN" && checkinStatus === "2");
    const canTest = isMatchingLoc && isCheckedIn;

    return (
      <div style={{ 
        marginBottom: "2rem", 
        padding: "1.25rem", 
        background: canTest ? "#f0fdf4" : "#fffbeb", 
        borderRadius: "12px", 
        border: `1px solid ${canTest ? "#10b981" : "#f59e0b"}`, 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, color: canTest ? "#166534" : "#92400e", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className={`fas ${canTest ? "fa-check-circle" : "fa-exclamation-triangle"}`}></i> 
            {canTest ? "Asset Siap Digunakan" : "Asset Belum Siap Untuk Pengujian"}
          </h4>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div><strong>Asset ID:</strong> {equip.id || "-"}</div>
              <div><strong>Model/Varian:</strong> {localApp.equipment?.model?.name} / {localApp.equipment?.variant?.name}</div>
              <div><strong>S/N:</strong> {localApp.equipment?.serial_no}</div>
              {invoice && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f5f3ff", borderRadius: "8px", border: "1px solid #ddd6fe" }}>
                   <div style={{ fontSize: "0.7rem", color: "#6d28d9", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem" }}>Informasi Penagihan</div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600 }}>{invoice.invoice_number}</span>
                      <span className={`badge ${invoice.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: "0.65rem" }}>{invoice.status}</span>
                   </div>
                   <div style={{ fontSize: "1rem", fontWeight: 800, color: "#4c1d95", marginTop: "0.25rem" }}>Rp {invoice.total_price?.toLocaleString()}</div>
                   {localApp.package && (
                     <div style={{ fontSize: "0.75rem", color: "#7c3aed", marginTop: "0.25rem" }}>Paket: {localApp.package.name}</div>
                   )}
                </div>
              )}
            </div>
            <span>
              <strong>Lokasi:</strong>{" "}
              <span style={{ color: isMatchingLoc ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                {equip.asset_location?.name || currentLoc || "Belum Terdata"}
              </span>
              {!isMatchingLoc && targetLocName && (
                <span style={{ color: "#64748b", fontStyle: "italic", marginLeft: "10px" }}>
                  (Seharusnya di: {targetLocName})
                </span>
              )}
            </span>
            <span>
              <strong>Status:</strong>{" "}
              <span style={{ color: isCheckedIn ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                {resolvedStatusName || "N/A"}
              </span>
            </span>
          </div>
          {!canTest && (
            <p style={{ margin: "10px 0 0 0", fontSize: "0.85rem", color: "#b45309", fontWeight: 600 }}>
               Aset harus berada di lokasi pengujian{targetLocName ? `: ${targetLocName}` : ""} dan memiliki status <strong>Check-in</strong> sebelum hasil uji dapat disimpan.
            </p>
          )}
        </div>
        {!canTest && testLoc && (
          <button className="btn btn-warning" onClick={handleAssetCheckIn}>
            <i className="fas fa-sign-in-alt"></i> Lakukan Check-in
          </button>
        )}
        {canTest && (
          <div style={{ color: "#10b981", fontWeight: 800, textAlign: "right" }}>
            <i className="fas fa-check-double"></i> Verified Assets
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisView = () => {
    const isPreExecution = ["REGISTERED", "VERIFIED", "APPROVED", "PLANNED", "REVISI"].includes((localApp.status || "").toUpperCase());
    if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>;
    const labResults = executionData.filter((r) => {
      const tc = (r.test_type_code || "").toUpperCase();
      return tc === "LAB" || tc === "LABORATORIUM" || tc === "FNL" || tc === "REL" || tc === "SAF";
    });
    const fieldResults = executionData.filter((r) => {
      const tc = (r.test_type_code || "").toUpperCase();
      return tc === "FLD" || tc === "FIELD" || tc === "LAPANGAN";
    });
    const otherResults = executionData.filter((r) => {
      const tc = (r.test_type_code || "").toUpperCase();
      const isLab = ["LAB", "LABORATORIUM", "FNL", "REL", "SAF"].includes(tc);
      const isField = ["FLD", "FIELD", "LAPANGAN"].includes(tc);
      return !isLab && !isField && tc !== "";
    });
    const finalCalc = calculateFinalHierarchyScore(executionData);

    const useAggregation = stage === "analysis" || stage === "testing" || localApp.status === "Executed";
    const finalScore = useAggregation ? finalCalc.finalScore : (localApp.final_score || (isPreExecution ? 0 : finalCalc.finalScore));
    const allAspectsPassed = useAggregation ? finalCalc.allPassed : localApp.aspects_passed !== false;

    let calculatedStatus = "";
    if (!allAspectsPassed || finalScore < 65) {
      calculatedStatus = "TIDAK LULUS";
    } else {
      calculatedStatus = "LULUS";
    }

    let finalStatusLabel = overrideStatus || localApp.final_status || (isPreExecution && !localApp.final_status ? "-" : calculatedStatus);
    if (stage !== "analysis" && stage !== "testing") {
      finalStatusLabel = localApp.final_status || (isPreExecution && !localApp.final_status ? "-" : calculatedStatus);
    }

    const isLulus = finalStatusLabel && finalStatusLabel.toUpperCase().includes("LULUS") && !finalStatusLabel.toUpperCase().includes("TIDAK") && !isPreExecution;
    const isLocked = localApp.status !== "Planned" && stage === "testing";

    return (
      <div style={{ marginTop: "1rem" }}>
        <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>SKOR AKHIR GABUNGAN</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>{isPreExecution && finalScore === 0 ? "-" : finalScore.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>KESIMPULAN</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isLulus ? "#10b981" : "#ef4444" }}>{finalStatusLabel.toUpperCase()}</div>
              {finalStatusLabel.includes("OVERRIDE") && (
                <span style={{ fontSize: "0.6rem", background: "#fef08a", color: "#854d0e", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                  <i className="fas fa-exclamation-triangle"></i> OVERRIDE ANALISA
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          {renderAnalysisGroup("Analisa Uji Laboratorium", labResults, "fas fa-flask", "#166534", "#f0fdf4")}
          {renderAnalysisGroup("Analisa Uji Lapangan", fieldResults, "fas fa-mountain", "#92400e", "#fffbeb")}
          {renderAnalysisGroup("Analisa Uji Umum (MANAG)", otherResults, "fas fa-clipboard-check", "#475569", "#f1f5f9")}
        </div>
        {localApp.testing_report_ai?.report_ai && stage !== "analysis" && stage !== "reporting" && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
            <h5 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fas fa-file-contract" style={{ color: "#0ea5e9" }}></i> Kesimpulan Analisa Data
            </h5>
            <div style={{
              whiteSpace: "pre-wrap", fontSize: "0.85rem", color: "#334155",
              lineHeight: "1.6", background: "#ffffff", padding: "1rem",
              borderRadius: "8px", border: "1px solid #cbd5e1", fontFamily: "monospace"
            }}>
              {localApp.testing_report_ai?.report_ai}
            </div>
          </div>
        )}
        {(stage === "analysis" || stage === "reporting") && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <label style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                Kesimpulan Analisa Data
              </label>
              <textarea
                className="form-control"
                rows="8"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                style={{ fontSize: "0.85rem", background: "white", color: "#0f172a", fontFamily: "monospace", lineHeight: "1.5", padding: "12px", borderRadius: "8px" }}
                placeholder="Rancangan draf laporan kelayakan atau kesimpulan analisa data akan tampil di sini setelah digenerate..."
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", alignItems: "center" }}>
              <label style={{ fontWeight: 700, color: "#1e293b", minWidth: "120px", fontSize: "0.9rem" }}>Ubah / Timpa Keputusan</label>
              <select
                className="form-control"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                style={{ width: "250px", fontWeight: "bold", background: overrideStatus ? "#fffbeb" : "white", color: overrideStatus ? "#b45309" : "#475569" }}
              >
                <option value="">Otomatis (Sesuai Keputusan Sebelumnya)</option>
                <option value="LULUS">Override Khusus: LULUS</option>
                <option value="TIDAK LULUS">Override Khusus: TIDAK LULUS</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <label style={{ fontWeight: 700, color: "#1e293b", minWidth: "120px", fontSize: "0.9rem" }}>
                Catatan {stage === "analysis" ? "Analisa" : "Pelaporan"} {overrideStatus && <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>*</span>}
              </label>
              <textarea
                className="form-control"
                rows="1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ background: overrideStatus && !notes.trim() ? "#fef2f2" : "white", border: overrideStatus && !notes.trim() ? "1px solid #ef4444" : "", fontSize: "0.9rem", flex: 1 }}
                placeholder={overrideStatus ? "Wajib beri justifikasi lengkap mengapa hasil akhir alat ini di-override..." : "Tulis catatan tambahan (opsional)..."}
              ></textarea>

              {stage === "analysis" && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-secondary btn-sm" onClick={onCancel}>
                    Batal
                  </button>
                  {aiReportEnabled && (
                    <button
                      className="btn btn-outline-info btn-sm"
                      disabled={aiGenerating}
                      onClick={handleGenerateAIReport}
                    >
                      <i className={aiGenerating ? "fas fa-spinner fa-spin" : "fas fa-robot"}></i> Laporan AI
                    </button>
                  )}
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => printTechnicalReport({ ...localApp, testing_report_ai: { report_ai: conclusion } }, executionData, locations, {
                      appConfig: appConfig,
                      headerTitle: appConfig.REPORT_HEADER_TITLE
                    })}
                  >
                    <i className="fas fa-print"></i> Print Laporan
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (!notes || !notes.trim()) {
                        alert("Catatan revisi wajib diisi!");
                        return;
                      }
                      handleAction("REVISION");
                    }}
                  >
                    Revisi
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      // Blokade jika user overide tetapi diam
                      if (overrideStatus && (!notes || !notes.trim())) {
                        alert("PERINTAH OVERRIDE DITOLAK: Anda wajib mengisi rincian catatan analisa dengan detail mengapa hasil akhir diubah mendahului kalkulasi sistem skor.");
                        return;
                      }
                      const payloadFinalStatus = overrideStatus ? `OVERRIDE: ${overrideStatus}` : "";
                      handleAction("ANALYZE", payloadFinalStatus);
                    }}
                  >
                    Selesaikan Analisa
                  </button>

                </div>
              )}
            </div>

            {stage === "reporting" && localApp.analysis_notes && !overrideStatus && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px", fontSize: "0.85rem", color: "#854d0e" }}>
                <strong>
                  <i className="fas fa-history"></i> Catatan Analisa Sebelumnya:
                </strong>{" "}
                {localApp.analysis_notes}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderActionPanel = () => {
    if (stage === "testing") {
      const labTests = executionData.filter((p) => {
        const tc = (p.test_type_code || "").toUpperCase();
        return tc === "LAB" || tc === "LABORATORIUM" || tc === "FNL" || tc === "REL" || tc === "SAF";
      });
      const fieldTests = executionData.filter((p) => {
        const tc = (p.test_type_code || "").toUpperCase();
        return tc === "FLD" || tc === "FIELD" || tc === "LAPANGAN";
      });
      const otherTests = executionData.filter((p) => {
        const tc = (p.test_type_code || "").toUpperCase();
        const isLab = tc === "LAB" || tc === "LABORATORIUM" || tc === "FNL" || tc === "REL" || tc === "SAF";
        const isField = tc === "FLD" || tc === "FIELD" || tc === "LAPANGAN";
        return !isLab && !isField && tc !== "";
      });
      return (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #bae6fd" }}>
            <span style={{ fontWeight: 700, color: "#0369a1" }}>
              <i className="fas fa-satellite-dish"></i> App ID IoT/Simulator: {localApp.id}
            </span>
          </div>
          {renderAssetCheckSection()}
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "1rem" }}>
            DEBUG: {executionData.length} parameter ditemukan. ({labTests.length} Lab, {fieldTests.length} Field, {otherTests.length} Lainnya)
          </div>
          {renderAspectGroups("Pengujian Laboratorium", labTests, "fas fa-flask", "#166534", "#f0fdf4")}
          {renderAspectGroups("Pengujian Lapangan", fieldTests, "fas fa-mountain", "#92400e", "#fffbeb")}
          {renderAspectGroups("Pengujian Lainnya / Umum", otherTests, "fas fa-clipboard-check", "#475569", "#f1f5f9")}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2.5rem", gap: "1rem" }}>
            <button className="btn btn-outline-primary" onClick={fetchAppDetail} disabled={loading} style={{ padding: "10px 20px" }}>
              <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i> {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button className="btn btn-secondary" onClick={onCancel} style={{ padding: "10px 20px" }}>
              Tutup
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                // Get all unique aspect codes
                const allAspects = Array.from(new Set(executionData.map(r => r.aspect_code)));
                
                // Cek apakah ada aspek yang belum tersimpan (Option 1)
                const hasUnsavedAspects = allAspects.some(aspCode => {
                    // Jika sedang diedit (ada input berubah)
                    const isCurrentlyEditing = aspectEditing[aspCode];
                    // Jika sudah tersimpan di sesi ini
                    const isSavedInSession = persistentSaved[aspCode] || aspectSaved[aspCode];
                    // Jika sudah pernah tersimpan di database sebelumnya
                    const isSavedInDB = (localApp.aspect_scores || []).some(s => s.aspect_code === aspCode);
                    
                    const isSaved = isSavedInSession || isSavedInDB;
                    
                    // Unsaved = sedang diedit ATAU belum pernah di-save sama sekali
                    return isCurrentlyEditing || !isSaved;
                });

                if (hasUnsavedAspects) {
                    alert("⚠️ Tidak bisa kirim ke analisa: Masih ada aspek pengujian yang belum disimpan. Pastikan semua aspek telah di-Save (tombol hijau 'Saved') sebelum mengirim ke Analisa.");
                    return;
                }

                handleAction("SUBMIT_TEST");
              }} 
              style={{ padding: "10px 30px" }}
            >
              <i className="fas fa-save"></i> Kirim ke Analisa
            </button>
          </div>
        </div>
      );
    }
    if (stage === "verification" || stage === "approval")
      return (
        <div style={{ marginTop: "1rem", padding: "1.25rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontWeight: 700, fontSize: "0.95rem", color: "#475569" }}>
              {stage === "approval" ? "Catatan Persetujuan" : "Catatan Verifikasi"}
            </label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              style={{ background: "white", fontSize: "0.9rem", width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "0.5rem" }} 
              placeholder="Tambahkan catatan di sini..."
            ></textarea>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={onCancel} style={{ padding: "6px 16px", borderRadius: "6px" }}>
                Tutup
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleAction("REVISI")} style={{ padding: "6px 16px", borderRadius: "6px" }}>
                Revisi
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleAction("VERIFY")} style={{ padding: "6px 20px", borderRadius: "6px", fontWeight: 700 }}>
                Terima
              </button>
            </div>
          </div>
        </div>
      );
    if (stage === "analysis") return renderAnalysisView();
    if (stage === "reporting") {
      const isAlreadyCertified = (localApp.status || "").toUpperCase() === "CERTIFIED";
      return (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: isAlreadyCertified ? "#f0f9ff" : "#f0fdf4", borderRadius: "12px", border: `1px solid ${isAlreadyCertified ? "#bae6fd" : "#bcf0da"}` }}>
          <h4 style={{ marginBottom: "1rem", color: isAlreadyCertified ? "#0369a1" : "#065f46" }}>
            <i className={`fas ${isAlreadyCertified ? "fa-print" : "fa-certificate"}`}></i> {isAlreadyCertified ? "Cetak Sertifikat & Selesaikan" : "Finalisasi Sertifikat"}
          </h4>
          {renderAnalysisView()}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button className="btn btn-secondary" onClick={onCancel}>
              Tutup
            </button>
             {isAlreadyCertified ? (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    printTechnicalReport({ ...localApp, testing_report_ai: { report_ai: conclusion } }, executionData, locations, {
                      appConfig: appConfig,
                      headerTitle: appConfig.CERT_HEADER_TITLE || "SERTIFIKAT HASIL PENGUJIAN (SHP)"
                    });
                    handleAction("FINALIZE_PRINT");
                  }} 
                  style={{ padding: "10px 25px" }}
                >
                  <i className="fas fa-print"></i> Cetak & Finalisasi Data
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline-success" onClick={() => printTechnicalReport({ ...localApp, testing_report_ai: { report_ai: conclusion } }, executionData, locations, {
                  appConfig: appConfig,
                  headerTitle: appConfig.REPORT_HEADER_TITLE
                })} style={{ padding: "10px 25px" }}>
                  <i className="fas fa-file-alt"></i> Pratinjau Laporan
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    if (overrideStatus && (!notes || !notes.trim())) {
                      alert("PERINTAH OVERRIDE DITOLAK: Anda wajib mengisi rincian catatan dengan detail mengapa hasil akhir diubah.");
                      return;
                    }
                    const payloadFinalStatus = overrideStatus ? `OVERRIDE: ${overrideStatus}` : "";
                    handleAction("FINALIZE", payloadFinalStatus);
                  }}
                  style={{ padding: "10px 25px" }}
                >
                  <i className="fas fa-check-circle"></i> Terbitkan Sertifikat
                </button>
              </>
            )}
          </div>
        </div>
      );
    }
    if (stage === "query") {
      const statusUpper = (localApp.status || "").toUpperCase();
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Tutup
          </button>
          {(["REGISTERED", "VERIFIED", "APPROVED"].includes(statusUpper) || ["EXECUTED", "ANALYZED", "REPORTING", "CERTIFIED", "FINALIZED"].includes(statusUpper)) && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["REGISTERED", "VERIFIED", "APPROVED"].includes(statusUpper)) && localApp.equipment && (
                <button 
                  className="btn" 
                  style={{ backgroundColor: "#1e293b", color: "white", padding: "10px 25px" }}
                  onClick={() => printAssetLabel(localApp.equipment, { appConfig })}
                >
                  <i className="fas fa-tag"></i> Cetak Label Asset
                </button>
              )}
              <button 
                className="btn btn-outline-success" 
                onClick={() => {
                  if (["REGISTERED", "VERIFIED", "APPROVED"].includes(statusUpper)) {
                    printRegistrationProof(localApp, appConfig);
                  } else if (statusUpper === "CERTIFIED" || statusUpper === "FINALIZED") {
                    printTechnicalReport({ ...localApp, testing_report_ai: { report_ai: conclusion } }, executionData, locations, {
                      appConfig,
                      headerTitle: appConfig.CERT_HEADER_TITLE || "SERTIFIKAT HASIL PENGUJIAN (SHP)"
                    });
                  } else {
                    printTechnicalReport({ ...localApp, testing_report_ai: { report_ai: conclusion } }, executionData, locations, {
                      appConfig,
                      headerTitle: appConfig.REPORT_HEADER_TITLE
                    });
                  }
                }} 
                style={{ padding: "10px 25px" }}
              >
                <i className="fas fa-print"></i> {["REGISTERED", "VERIFIED", "APPROVED"].includes(statusUpper) ? "Bukti Registrasi" : "Cetak Laporan"}
              </button>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!localApp) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}></i>
        <div>Memuat detail pengajuan...</div>
      </div>
    );
  }

  return (
    <div className="app-detail" style={{ minWidth: window.innerWidth < 1024 ? "800px" : "auto" }}>
      <div className="card" style={{ marginBottom: "1.5rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", padding: "1.25rem", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Registrasi</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b" }}>{localApp.reg_number}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>App ID (IoT)</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#10b981" }}>{localApp.id}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Saat Ini</div>
            <span className="badge badge-blue" style={{ fontSize: "0.85rem", padding: "4px 12px", borderRadius: "20px" }}>
              {localApp.status}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", padding: "1.25rem" }}>
          {/* Section 1: Pemohon */}
          <div>
            <h6 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>INFORMASI PEMOHON</h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>REKANAN / INSTANSI</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{localApp.partner?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>KATEGORI PEMOHON</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{localApp.partner?.type?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>PIC</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{localApp.partner?.pic_name || "-"}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {localApp.partner?.pic_email} | {localApp.partner?.pic_phone}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Peralatan */}
          <div>
            <h6 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>DETAIL PERALATAN / MATERIIL</h6>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div style={{ gridColumn: "span 2" }}>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>NAMA PERALATAN</div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b" }}>{localApp.equipment?.equipment_name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>KATEGORI</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.category?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>MERK / BRAND</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.brand?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>MODEL</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.model?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>VARIAN / TIPE</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.variant?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>NEGARA ASAL</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.brand?.origin?.name || localApp.equipment?.brand?.origin_code || "-"}</div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>SPESIFIKASI TEKNIS</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{localApp.equipment?.technical_spec || "-"}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Testing Info & Billing */}
          <div>
            <h6 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>SPESIFIKASI & PENAGIHAN</h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>PAKET LAYANAN</div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#7c3aed" }}>
                  {localApp.package ? `${localApp.package.package_code} - ${localApp.package.name}` : "Uji Mandiri (Custom)"}
                </div>
              </div>
              
              {invoice && (
                <div style={{ marginTop: "0.25rem", padding: "0.75rem", background: "#f5f3ff", borderRadius: "8px", border: "1px solid #ddd6fe" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "#6d28d9", fontWeight: 700 }}>NO. INVOICE</div>
                      <span className={`badge ${invoice.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: "0.6rem", padding: "2px 8px" }}>{invoice.status}</span>
                   </div>
                   <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{invoice.invoice_number}</div>
                   <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>TOTAL BIAYA</div>
                   <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#4c1d95" }}>Rp {invoice.total_amount?.toLocaleString()}</div>
                </div>
              )}

              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>NO. BATCH / SERI</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{localApp.equipment?.batch_number || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0.75rem 1.25rem", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {localApp.request_letter_path && (
              <a href={getDownloadUrl(localApp.request_letter_path)} target="_blank" className="btn btn-outline-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                <i className="fas fa-file-pdf"></i> Surat Permohonan
              </a>
            )}
            {localApp.equipment?.factory_spec_path && (
              <a href={getDownloadUrl(localApp.equipment.factory_spec_path)} target="_blank" className="btn btn-outline-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                <i className="fas fa-file-pdf"></i> Dokumen Teknis
              </a>
            )}
            {localApp.equipment?.quality_doc_path && (
              <a href={getDownloadUrl(localApp.equipment.quality_doc_path)} target="_blank" className="btn btn-outline-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                <i className="fas fa-file-pdf"></i> Dokumen Mutu
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            <i className="fas fa-info-circle"></i> Pastikan seluruh dokumen telah divalidasi
          </div>
        </div>
      </div>
      {["PLANNED", "EXECUTED", "ANALYZED", "REPORTING", "CERTIFIED", "FINALIZED"].includes((localApp.status || "").toUpperCase()) && stage !== "analysis" && stage !== "testing" && (
        <div style={{ marginTop: "2rem", borderTop: "2px solid #f1f5f9", paddingTop: "2rem" }}>
          <h4 style={{ marginBottom: "1.5rem", color: "#1e293b" }}>
            <i className="fas fa-chart-bar" style={{ color: "#10b981" }}></i> Detil Analisa & Hasil
          </h4>
          {renderAnalysisView()}
        </div>
      )}
      {renderActionPanel()}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleCameraCapture}
      />
      {/* AI Draft Preview Modal */}
      {showAIModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 10000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "16px", width: "90%",
            maxWidth: "700px", padding: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            display: "flex", flexDirection: "column", maxHeight: "85vh"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fas fa-robot" style={{ color: "#0ea5e9" }}></i> Draf Laporan Kelayakan
              </h3>
              <button 
                onClick={() => setShowAIModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#64748b" }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Draf Narasi Laporan</div>
              <textarea
                style={{
                  width: "100%", height: "260px", padding: "12px",
                  borderRadius: "8px", border: "1px solid #cbd5e1",
                  fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.5",
                  background: "#f8fafc", color: "#0f172a", resize: "none"
                }}
                value={aiReportText}
                onChange={(e) => setAiReportText(e.target.value)}
              />
              <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: aiGenerating ? "#3b82f6" : "#10b981", fontWeight: "bold" }}>
                {aiGenerating ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sedang Proses Generate Laporan AI...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Proses Generate Laporan AI selesai.</>
                )}
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                * Anda dapat mengoreksi atau mengedit langsung draf teks di atas sebelum menerapkannya ke catatan.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setShowAIModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn btn-success btn-sm"
                onClick={() => {
                  setNotes(aiReportText);
                  setShowAIModal(false);
                }}
                disabled={aiGenerating}
              >
                <i className="fas fa-comment-alt"></i> Gunakan Sebagai Catatan
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setConclusion(aiReportText);
                  setShowAIModal(false);
                }}
                disabled={aiGenerating}
              >
                <i className="fas fa-check"></i> Gunakan Sebagai Kesimpulan
              </button>
            </div>
          </div>
        </div>
      )}

      {anomalyBlock && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 10000,
          backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "16px", width: "90%",
            maxWidth: "550px", padding: "1.75rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            display: "flex", flexDirection: "column", maxHeight: "85vh",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            fontFamily: "'Inter', sans-serif"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🚨</span>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#991b1b" }}>Peringatan Deteksi Anomali AI (PQC)</h3>
              </div>
              <button 
                onClick={handleCancelAnomalyModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#94a3b8", transition: "color 0.2s" }}
              >
                &times;
              </button>
            </div>
            
            {/* Content */}
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px", marginBottom: "1.25rem" }}>
              <div style={{
                background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "6px",
                padding: "0.75rem 1rem", fontSize: "0.9rem", color: "#991b1b", lineHeight: "1.5",
                marginBottom: "1.25rem"
              }}>
                {anomalyBlock.message}
              </div>

              {/* Contributor Features (SHAP Values) */}
              {Object.keys(anomalyBlock.shapValues).length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
                    Parameter Penyumbang Anomali Terbesar:
                  </div>
                  {Object.entries(anomalyBlock.shapValues)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, val]) => {
                      const medianVal = anomalyBlock.medians?.[key] ?? 0.0;
                      const rawStd = anomalyBlock.stds?.[key];
                      const stdVal = (rawStd !== undefined && rawStd !== null && !isNaN(rawStd)) ? parseFloat(rawStd) : 2.0;
                      const rangeMargin = stdVal * 1.5;
                      const lowerBound = Math.max(0.0, medianVal - rangeMargin);
                      const upperBound = Math.min(100.0, medianVal + rangeMargin);

                      // Find actual test score from aspectItems for this sub_aspect_code
                      const matchedItem = anomalyBlock.aspectItems?.find(
                        (p) => p.sub_aspect_code === key || p.param_code === key
                      );
                      const actualScore = matchedItem ? parseFloat(matchedItem.actual_value) : null;
                      const isOutOfRange = actualScore !== null && (actualScore < lowerBound || actualScore > upperBound);

                      return (
                        <div key={key} style={{ marginBottom: "1rem", background: isOutOfRange ? "#fff5f5" : "#f8fafc", padding: "0.6rem 0.75rem", borderRadius: "8px", border: isOutOfRange ? "1px solid #fecaca" : "1px solid #e2e8f0" }}>
                          {/* Sub-aspect name + contribution badge */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                            <span style={{ fontWeight: 700, color: isOutOfRange ? "#b91c1c" : "#334155", fontSize: "0.85rem" }}>
                              {key}
                              {isOutOfRange && <span style={{ marginLeft: "6px", fontSize: "0.7rem", background: "#fee2e2", color: "#b91c1c", padding: "1px 6px", borderRadius: "999px" }}>⚠ Di luar batas</span>}
                            </span>
                            <span style={{ fontWeight: 600, color: "#64748b", fontSize: "0.75rem", background: "#e2e8f0", padding: "2px 8px", borderRadius: "999px" }}>Kontribusi: {val}%</span>
                          </div>
                          {/* Actual score vs normal range */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                            {actualScore !== null && (
                              <span style={{ background: isOutOfRange ? "#b91c1c" : "#1d4ed8", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                                Skor Input: {actualScore.toFixed(1)}
                              </span>
                            )}
                            {anomalyBlock.medians && anomalyBlock.medians[key] !== undefined && (
                              <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px" }}>
                                Normal: {medianVal.toFixed(1)} &plusmn; {rangeMargin.toFixed(1)} <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(σ={stdVal.toFixed(1)} poin)</span>
                              </span>
                            )}
                            {anomalyBlock.medians && anomalyBlock.medians[key] !== undefined && (
                              <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px" }}>
                                Batas: {lowerBound.toFixed(1)} &ndash; {upperBound.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {/* Contribution progress bar */}
                          <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${val}%`, background: isOutOfRange ? "#ef4444" : "#f87171", borderRadius: "999px" }} />
                          </div>
                          {/* Per sub-aspect note (required for out-of-range) */}
                          {isOutOfRange && (
                            <div style={{ marginTop: "0.4rem" }}>
                              <input
                                type="text"
                                placeholder={`Catatan wajib untuk ${key} (misal: alat rusak, kondisi cuaca)...`}
                                value={anomalySubNotes[key] || ""}
                                onChange={(e) => setAnomalySubNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fecaca", fontSize: "0.78rem", background: "#fff", boxSizing: "border-box", color: "#0f172a" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* Override Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* Instruction callout */}
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "0.6rem 0.85rem", fontSize: "0.8rem", color: "#1e40af", lineHeight: "1.5", marginBottom: "0.25rem" }}>
                  <strong>ℹ️ Cara Override:</strong> Minta <strong>Supervisor / SUPERVISOR_SCORE</strong> untuk hadir dan memasukkan <strong>username &amp; password akun login-nya sendiri</strong> di bawah ini. Bukan password Anda.
                </div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Alasan Override (Wajib):
                </label>
                <textarea
                  style={{
                    width: "100%", height: "75px", padding: "10px",
                    borderRadius: "8px", border: "1px solid #cbd5e1",
                    fontSize: "0.85rem", lineHeight: "1.4",
                    background: "#ffffff", color: "#0f172a", resize: "none",
                    marginBottom: "0.25rem"
                  }}
                  placeholder="Contoh: Pembacaan anomali divalidasi manual dan dipastikan aman..."
                  value={overrideReasonInput}
                  onChange={(e) => setOverrideReasonInput(e.target.value)}
                />

                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                    🔐 Otorisasi Supervisor
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#78350f", display: "block", marginBottom: "3px" }}>
                        Username Supervisor
                      </label>
                      <input
                        type="text"
                        placeholder="Username akun supervisor"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #fcd34d", fontSize: "0.82rem", background: "#fff", boxSizing: "border-box" }}
                        id="spvUsername"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#78350f", display: "block", marginBottom: "3px" }}>
                        Password Supervisor
                      </label>
                      <input
                        type="password"
                        placeholder="Password akun supervisor"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #fcd34d", fontSize: "0.82rem", background: "#fff", boxSizing: "border-box" }}
                        id="spvPassword"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleCancelAnomalyModal}
                style={{ borderRadius: "6px" }}
              >
                Batalkan
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (!overrideReasonInput.trim()) {
                    alert("⚠️ Alasan override wajib diisi sebelum menyimpan!");
                    return;
                  }
                  // Check per-anomaly sub-aspect notes
                  const shapEntries = Object.entries(anomalyBlock.shapValues || {});
                  const missingNotes = [];
                  shapEntries.forEach(([key]) => {
                    const medianVal = anomalyBlock.medians?.[key] ?? 0.0;
                    const rawStd = anomalyBlock.stds?.[key];
                    const stdVal = (rawStd !== undefined && rawStd !== null && !isNaN(rawStd)) ? parseFloat(rawStd) : 2.0;
                    const margin = stdVal * 1.5;
                    const lo = Math.max(0.0, medianVal - margin);
                    const hi = Math.min(100.0, medianVal + margin);
                    const matchedItem = anomalyBlock.aspectItems?.find(p => p.sub_aspect_code === key || p.param_code === key);
                    const actualScore = matchedItem ? parseFloat(matchedItem.actual_value) : null;
                    const isOOR = actualScore !== null && (actualScore < lo || actualScore > hi);
                    if (isOOR && !(anomalySubNotes[key] || "").trim()) {
                      missingNotes.push(key);
                    }
                  });
                  if (missingNotes.length > 0) {
                    alert(`⚠️ Catatan wajib diisi untuk sub-aspek anomali: ${missingNotes.join(", ")}`);
                    return;
                  }
                  const spvUser = document.getElementById("spvUsername")?.value || "";
                  const spvPass = document.getElementById("spvPassword")?.value || "";
                  if (!spvUser.trim() || !spvPass.trim()) {
                    alert("⚠️ Username dan Password Supervisor wajib diisi!");
                    return;
                  }
                  // Validate supervisor is NOT the logged-in operator
                  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                  const loggedInUsername = (storedUser.username || "").toLowerCase();
                  if (spvUser.trim().toLowerCase() === loggedInUsername) {
                    alert("⚠️ Username Supervisor tidak boleh sama dengan username Anda (" + loggedInUsername + "). Minta Supervisor yang berbeda untuk melakukan otorisasi.");
                    return;
                  }
                  // Combine override reason with per-sub-aspect notes
                  const subNotesSummary = Object.entries(anomalySubNotes)
                    .filter(([, v]) => v.trim())
                    .map(([k, v]) => `[${k}] ${v.trim()}`)
                    .join("; ");
                  const fullReason = subNotesSummary
                    ? `${overrideReasonInput.trim()} | Detail: ${subNotesSummary}`
                    : overrideReasonInput.trim();
                  handleSaveAspect(anomalyBlock.aspectCode, anomalyBlock.aspectItems, anomalyBlock.isReady, true, fullReason, spvUser, spvPass);
                }}
                style={{ borderRadius: "6px", fontWeight: 600 }}
              >
                💾 Simpan dengan Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDetail;
