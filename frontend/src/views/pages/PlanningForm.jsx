import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@models/api";
import ToolAvailabilityGrid from "@components/ToolAvailabilityGrid";
import { useToast } from '@context/ToastContext';

const PlanningForm = ({ app, appConfig = {}, onCancel, onSuccess, checkPasswordRequirement }) => {
  const { showToast } = useToast();
  const isToggleEnabled = (appConfig.TOGGLE_SUB_ASPECT_ENABLE || "false").toString().trim().toLowerCase() === "true";
  const [testers, setTesters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [methodologies, setMethodologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingTools, setTestingTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [showToolGrid, setShowToolGrid] = useState(null);
  const fetchedRef = useRef(false);
  const [invoice, setInvoice] = useState(app?.invoice || null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const invRes = await apiRequest(`/invoices?application_id=${app.id}`);
        if (invRes && invRes.data && invRes.data.length > 0) {
          setInvoice(invRes.data[0]);
        }
      } catch (err) {
        console.warn("Fetch invoice error:", err);
      }
    };
    if (app?.id && !invoice) {
      fetchInvoice();
    }
  }, [app?.id]);

  const [form, setForm] = useState({
    status: "Planned",
    lab_methodology_code: app?.lab_methodology_code || "",
    field_methodology_code: app?.field_methodology_code || "",
    methodology_code: app?.methodology_code || "",
  });

  // Scroring Parameters state
  const [labParameters, setLabParameters] = useState([]);
  const [fieldParameters, setFieldParameters] = useState([]);
  const [managementParameters, setManagementParameters] = useState([]);

  // Teams and Plans state
  const [labTeam, setLabTeam] = useState(app?.lab_teams || []);
  const [fieldTeam, setFieldTeam] = useState(app?.field_teams || []);

  // New: Dynamic test plans per aspect
  const [labPlans, setLabPlans] = useState([]);
  const [fieldPlans, setFieldPlans] = useState([]);
  const [managementPlans, setManagementPlans] = useState([]);

  // Initialize labPlans and fieldPlans if already present in app.test_plans
  useEffect(() => {
    if (app?.test_plans) {
      try {
        const existingPlans = typeof app.test_plans === "string" ? JSON.parse(app.test_plans) : app.test_plans;
        if (Array.isArray(existingPlans)) {
          setLabPlans(existingPlans.filter((p) => p.type === "LAB"));
          setFieldPlans(existingPlans.filter((p) => p.type === "FIELD"));
          setManagementPlans(existingPlans.filter((p) => p.type === "MANAG"));
        }
      } catch (e) {
        console.error("Error parsing test_plans", e);
      }
    }
  }, [app?.test_plans]);

  useEffect(() => {
    const fetchLabAspects = async () => {
      if (form.lab_methodology_code) {
        const pkgParam = app?.package_id ? `&package_id=${app.package_id}` : "";
        const data = await apiRequest(`/scoring-aspects?methodology_code=${form.lab_methodology_code}${pkgParam}`);
        if (data) {
          const aspectArray = Array.isArray(data) ? data : (data.data || []);
          setLabParameters(aspectArray);
          // Initialize plans for these aspects if they don't exist
          setLabPlans((prev) => {
            const newPlans = [...prev];
            aspectArray.forEach((aspect) => {
              const existingPlan = newPlans.find((p) => p.aspect_code === aspect.code);
              if (!existingPlan) {
                newPlans.push({
                  type: "LAB",
                  aspect_code: aspect.code,
                  aspect_name: aspect.name,
                  location_code: "",
                  scheduled_date: "",
                  team: [],
                  tools: [],
                  is_used: aspect.is_used, // Include initial is_used status
                });
              } else {
                // Ensure is_used is synced if aspect data changed
                existingPlan.is_used = aspect.is_used;
              }
            });
            return newPlans;
          });
        }
      } else {
        setLabParameters([]);
        setLabPlans([]);
      }
    };
    fetchLabAspects();
  }, [form.lab_methodology_code]);

  useEffect(() => {
    const fetchFieldAspects = async () => {
      if (form.field_methodology_code) {
        const pkgParam = app?.package_id ? `&package_id=${app.package_id}` : "";
        const data = await apiRequest(`/scoring-aspects?methodology_code=${form.field_methodology_code}${pkgParam}`);
        if (data) {
          const aspectArray = Array.isArray(data) ? data : (data.data || []);
          setFieldParameters(aspectArray);
          setFieldPlans((prev) => {
            const newPlans = [...prev];
            aspectArray.forEach((aspect) => {
              const existingPlan = newPlans.find((p) => p.aspect_code === aspect.code);
              if (!existingPlan) {
                newPlans.push({
                  type: "FIELD",
                  aspect_code: aspect.code,
                  aspect_name: aspect.name,
                  location_code: "",
                  scheduled_date: "",
                  team: [],
                  tools: [],
                  is_used: aspect.is_used,
                });
              } else {
                existingPlan.is_used = aspect.is_used;
              }
            });
            return newPlans;
          });
        }
      } else {
        setFieldParameters([]);
        setFieldPlans([]);
      }
    };
    fetchFieldAspects();
  }, [form.field_methodology_code]);

  useEffect(() => {
    const fetchManagementAspects = async () => {
      if (form.methodology_code) {
        const pkgParam = app?.package_id ? `&package_id=${app.package_id}` : "";
        const data = await apiRequest(`/scoring-aspects?methodology_code=${form.methodology_code}${pkgParam}`);
        if (data) {
          const aspectArray = Array.isArray(data) ? data : (data.data || []);
          setManagementParameters(aspectArray);
          setManagementPlans((prev) => {
            const newPlans = [...prev];
            aspectArray.forEach((aspect) => {
              const existingPlan = newPlans.find((p) => p.aspect_code === aspect.code);
              if (!existingPlan) {
                newPlans.push({
                  type: "MANAG",
                  aspect_code: aspect.code,
                  aspect_name: aspect.name,
                  location_code: "",
                  scheduled_date: "",
                  team: [],
                  tools: [],
                  is_used: aspect.is_used,
                });
              } else {
                existingPlan.is_used = aspect.is_used;
              }
            });
            return newPlans;
          });
        }
      } else {
        setManagementParameters([]);
        setManagementPlans([]);
      }
    };
    fetchManagementAspects();
  }, [form.methodology_code]);

  const fetchedLocationsRef = useRef(new Set());

  const fetchData = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const [testerData, locData, methodData] = await Promise.all([
        apiRequest("/tester-masters"),
        apiRequest("/locations"),
        apiRequest("/methodologies"),
      ]);
      if (testerData) setTesters(Array.isArray(testerData) ? testerData : (testerData.data || []));
      if (locData) setLocations(Array.isArray(locData) ? locData : (locData.data || []));
      if (methodData) setMethodologies(Array.isArray(methodData) ? methodData : (methodData.data || []));
    } catch (err) {
      console.error("Fetch form data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allPlans = [...labPlans, ...fieldPlans, ...managementPlans];
    const uniqueLocations = [...new Set(allPlans.map(p => p.location_code).filter(Boolean))];
    
    uniqueLocations.forEach(async (locCode) => {
      if (!fetchedLocationsRef.current.has(locCode)) {
        fetchedLocationsRef.current.add(locCode);
        try {
          const data = await apiRequest(`/testing-tools?location_code=${locCode}`);
          if (data) {
            const tools = Array.isArray(data) ? data : (data.data || []);
            setTestingTools(prev => {
               const existingCodes = new Set(prev.map(t => t.code));
               const newTools = tools.filter(t => !existingCodes.has(t.code));
               return [...prev, ...newTools];
            });
          }
        } catch (err) {
          fetchedLocationsRef.current.delete(locCode);
          console.error(`Failed to fetch tools for location ${locCode}`, err);
        }
      }
    });
  }, [labPlans, fieldPlans, managementPlans]);
  useEffect(() => {
    fetchData();
  }, []);

  const togglePlanTool = (type, aspectCode, tool) => {
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);
    setPlans((prev) =>
      prev.map((p) => {
        if (p.aspect_code === aspectCode) {
          const tools = p.tools || [];
          const exists = tools.find((t) => t.code === tool.code);
          return {
            ...p,
            tools: exists ? tools.filter((t) => t.code !== tool.code) : [...tools, { ...tool, start_hour: 8, end_hour: 17, quantity: 1 }],
          };
        }
        return p;
      })
    );
  };

  const replacePlanTool = (type, aspectCode, oldCode, newTool) => {
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);
    setPlans((prev) =>
      prev.map((p) => {
        if (p.aspect_code === aspectCode) {
          return {
            ...p,
            tools: (p.tools || []).map((t) => (t.code === oldCode ? { ...newTool, start_hour: t.start_hour || 8, end_hour: t.end_hour || 17, quantity: t.quantity || 1 } : t)),
          };
        }
        return p;
      })
    );
  };

  const updatePlanTool = (type, aspectCode, toolCode, field, value) => {
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);
    setPlans((prev) =>
      prev.map((p) => {
        if (p.aspect_code === aspectCode) {
          return {
            ...p,
            tools: (p.tools || []).map((t) => (t.code === toolCode ? { ...t, [field]: value } : t)),
          };
        }
        return p;
      })
    );
  };

  const updatePlan = (type, aspectCode, field, value) => {
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);
    setPlans((prev) => prev.map((p) => (p.aspect_code === aspectCode ? { ...p, [field]: value } : p)));
  };

  const toggleAspectUsed = async (type, aspectCode, currentVal) => {
    const newVal = !currentVal;
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);

    // Optimistic local update
    setPlans((prev) => prev.map((p) => (p.aspect_code === aspectCode ? { ...p, is_used: newVal } : p)));

    try {
      // Find the full aspect object to send update
      const aspects = type === "LAB" ? labParameters : (type === "FIELD" ? fieldParameters : managementParameters);
      const aspect = aspects.find((a) => a.code === aspectCode);
      if (aspect) {
        await apiRequest(`/management/scoring-aspects/${aspectCode}`, "PUT", {
          ...aspect,
          is_used: newVal,
        });
      }
    } catch (err) {
      console.error("Failed to toggle is_used on master data", err);
      // Revert on failure
      setPlans((prev) => prev.map((p) => (p.aspect_code === aspectCode ? { ...p, is_used: currentVal } : p)));
      showToast('Gagal merubah status: ' + err.message, 'error');
    }
  };

  const togglePlanMember = (type, aspectCode, tester) => {
    const setPlans = type === "LAB" ? setLabPlans : (type === "FIELD" ? setFieldPlans : setManagementPlans);
    setPlans((prev) =>
      prev.map((p) => {
        if (p.aspect_code === aspectCode) {
          const exists = p.team.some((m) => m.tester_id === tester.tester_id);
          if (exists) {
            return { ...p, team: p.team.filter((m) => m.tester_id !== tester.tester_id) };
          } else {
            return { ...p, team: [...p.team, { tester_id: tester.tester_id, name: tester.name, position: tester.position }] };
          }
        }
        return p;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION CHECK
    const allPlans = [...labPlans, ...fieldPlans, ...managementPlans].filter(p => p.is_used !== false);

    if (allPlans.length === 0) {
      showToast('Validasi: Belum ada perencanaan aspek (metodologi) yang dipilih.', 'warning');
      return;
    }

    for (const plan of allPlans) {
      if (!plan.location_code) {
        showToast(`Validasi: Harap pilih lokasi pengujian untuk aspek [${plan.aspect_name}].`, 'warning');
        return;
      }
      if (!plan.scheduled_date) {
        showToast(`Validasi: Harap tentukan jadwal pelaksanaan untuk aspek [${plan.aspect_name}].`, 'warning');
        return;
      }
      if (!plan.team || plan.team.length === 0) {
        showToast(`Validasi: Anda wajib menugaskan minimal satu tim penguji untuk aspek [${plan.aspect_name}].`, 'warning');
        return;
      }
    }

    const flattenedTools = [];
    allPlans.forEach((p) => {
      if (p.tools && p.tools.length > 0) {
        p.tools.forEach((t) => {
          flattenedTools.push({
            tool_code: t.code,
            start_hour: t.start_hour !== undefined ? t.start_hour : 8,
            end_hour: t.end_hour !== undefined ? t.end_hour : 17,
            quantity: t.quantity || 1,
            date: p.scheduled_date, // Use the aspect's scheduled date
          });
        });
      }
    });

    const payload = {
      ...form,
      relational_plans: allPlans,
      lab_team_json: JSON.stringify(labTeam.map((m) => ({ tester_id: m.tester_id, position: m.position }))),
      field_team_json: JSON.stringify(fieldTeam.map((m) => ({ tester_id: m.tester_id, position: m.position }))),
      testing_tools: flattenedTools,
    };

    // Create the actual submission function
    const performSubmission = async () => {
      setSubmitting(true);
      try {
        const res = await apiRequest(`/applications/${app.id}/plan`, "PUT", payload);
        if (res) {
          onSuccess("Perencanaan berhasil disimpan.");
        }
      } catch (err) {
        showToast(err.message || 'Gagal menyimpan perencanaan', 'error');
      } finally {
        setSubmitting(false);
      }
    };

    // Check if password is required for this menu, if so show modal, otherwise submit directly
    if (checkPasswordRequirement) {
      checkPasswordRequirement(performSubmission);
    } else {
      performSubmission();
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <i className="fas fa-spinner fa-spin"></i> Memuat data perencanaan...
      </div>
    );

  const renderPlanSection = (type) => {
    const isLab = type === "LAB";
    const plans = isLab ? labPlans : (type === "FIELD" ? fieldPlans : managementPlans);
    const color = isLab ? "#166534" : (type === "FIELD" ? "#92400e" : "#334155");
    const bgColor = isLab ? "#f0fdf4" : (type === "FIELD" ? "#fff9eb" : "#f8fafc");
    const borderColor = isLab ? "#bcf0da" : (type === "FIELD" ? "#fef3c7" : "#e2e8f0");
    const icon = isLab ? "fa-flask" : (type === "FIELD" ? "fa-mountain" : "fa-tasks");
    const locType = isLab ? "LAB" : (type === "FIELD" ? "FLD" : "MANAG");

    // Helper to determine color and bg
    let sectionColor = color;
    let sectionBg = bgColor;
    let sectionBorder = borderColor;

    if (type === "MANAG") {
      sectionColor = "#334155";
      sectionBg = "#f8fafc";
      sectionBorder = "#e2e8f0";
    }

    return (
      <div className="card" style={{ padding: "1.5rem", background: sectionBg, border: `1px solid ${sectionBorder}`, height: "fit-content" }}>
        <h3 style={{ marginBottom: "1rem", color: sectionColor }}>
          <i className={`fas ${icon}`}></i> {isLab ? "Perencanaan Uji Laboraturium" : (type === "FIELD" ? "Perencanaan Uji Lapangan" : "Perencanaan Uji Umum")}
        </h3>

        <div className="form-group">
          <label>Metodologi Utama</label>
          <select
            value={isLab ? form.lab_methodology_code : (type === "FIELD" ? form.field_methodology_code : form.methodology_code)}
            onChange={(e) => setForm({ ...form, [isLab ? "lab_methodology_code" : (type === "FIELD" ? "field_methodology_code" : "methodology_code")]: e.target.value })}
            style={{ border: `1px solid ${sectionBorder}`, fontWeight: 600 }}
          >
            <option value="">Pilih Metodologi</option>
            {(() => {
              const packageMethods = app?.package?.methodologies || [];
              const allowedCodes = packageMethods.map(pm => pm.code);
              
              return methodologies
                .filter((m) => {
                  const typeMatch = m.test_type_code === locType;
                  // If app has a package, restrict to that package's methodologies
                  // If no package assigned, allow all methodologies of that type
                  const packageMatch = !app?.package || allowedCodes.includes(m.code);
                  return typeMatch && packageMatch;
                })
                .map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ));
            })()}
          </select>
        </div>

        {plans.length > 0 && (
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: sectionColor, borderBottom: `2px solid ${sectionBorder}`, paddingBottom: "0.5rem" }}>Detail Rencana Per Aspek Scoring</div>
            {plans.map((plan) => {
              const isUsed = plan.is_used !== false;
              return (
                <div
                  key={plan.aspect_code}
                  className="plan-item"
                  style={{
                    background: isUsed ? "white" : "#f1f5f9",
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: isUsed ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    border: isUsed ? "1px solid #e2e8f0" : "1px dashed #cbd5e1",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: isUsed ? "#e2e8f0" : "#cbd5e1", borderRadius: "4px", fontWeight: 700 }}>{plan.aspect_code}</span>
                      <span style={{ fontWeight: 700, color: isUsed ? "#1e293b" : "#64748b", textDecoration: isUsed ? "none" : "line-through" }}>{plan.aspect_name}</span>
                    </div>
                    {/* Toggle is_used switch */}
                    <label className="switch" style={{ display: "inline-block", position: "relative", width: "40px", height: "20px" }}>
                      <input
                        type="checkbox"
                        checked={isUsed}
                        onChange={() => isToggleEnabled && toggleAspectUsed(type, plan.aspect_code, isUsed)}
                        disabled={!isToggleEnabled}
                      />
                      <span className="slider round" style={{ opacity: isToggleEnabled ? 1 : 0.6, cursor: isToggleEnabled ? "pointer" : "not-allowed" }}></span>
                    </label>
                  </div>
  
                  <div style={{ filter: isUsed ? "none" : "grayscale(1) opacity(0.5)", pointerEvents: isUsed ? "auto" : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div className="form-group" style={{ marginBottom: 0, flexDirection: "column", alignItems: "flex-start", gap: "0.4rem" }}>
                        <label style={{ flex: "none", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Lokasi Pengujian</label>
                        <select
                          value={plan.location_code}
                          onChange={(e) => {
                            const code = e.target.value;
                            const name = locations.find((l) => l.code === code)?.name || "";
                            updatePlan(type, plan.aspect_code, "location_code", code);
                            updatePlan(type, plan.aspect_code, "location_name", name);
                            updatePlan(type, plan.aspect_code, "tools", []);
                          }}
                          disabled={!isUsed}
                          style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem" }}
                        >
                          <option value="">Default Lokasi</option>
                          {locations
                            .filter((l) => l.test_type_code === locType)
                            .map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flexDirection: "column", alignItems: "flex-start", gap: "0.4rem" }}>
                        <label style={{ flex: "none", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Jadwal Pelaksanaan</label>
                        <input
                          type="date"
                          value={plan.scheduled_date}
                          onChange={(e) => updatePlan(type, plan.aspect_code, "scheduled_date", e.target.value)}
                          disabled={!isUsed}
                          style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
  
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem", display: "block" }}>Tim Penguji Khusus Aspek Ini</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", padding: "0.5rem", borderRadius: "6px", border: "1px dotted #cbd5e1", minHeight: "40px" }}>
                        {testers
                          .filter((t) => t.methodology_code === (isLab ? form.lab_methodology_code : (type === "FIELD" ? form.field_methodology_code : form.methodology_code)))
                          .map((t) => {
                            const isSelected = (plan.team || []).some((m) => m.tester_id === t.tester_id);
                            const currentTypeColor = isLab ? "#10b981" : (type === "FIELD" ? "#f59e0b" : "#475569");
                            return (
                              <div
                                key={t.tester_id}
                                onClick={() => isUsed && togglePlanMember(type, plan.aspect_code, t)}
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.7rem",
                                  cursor: isUsed ? "pointer" : "default",
                                  background: isSelected ? currentTypeColor : "#f8fafc",
                                  color: isSelected ? "white" : "#64748b",
                                  border: `1px solid ${isSelected ? currentTypeColor : "#e2e8f0"}`,
                                  fontWeight: isSelected ? 700 : 500,
                                }}
                              >
                                {isSelected && <i className="fas fa-check" style={{ marginRight: "3px" }}></i>}
                                {t.name}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem", display: "block" }}>Peralatan Uji Khusus Aspek Ini</label>
                      {!plan.location_code || String(plan.location_code).trim() === "" || String(plan.location_code) === "null" ? (
                        <div style={{ fontSize: "0.75rem", color: "#ef4444", fontStyle: "italic", padding: "0.5rem", border: "1px dashed #fca5a5", borderRadius: "6px", textAlign: "center", background: "#fef2f2" }}>
                          Silakan pilih Lokasi Pengujian terlebih dahulu untuk menampilkan daftar Peralatan Uji.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {(() => {
                          const availableTools = testingTools.filter((t) => !plan.location_code || t.location_code === plan.location_code || !t.location_code);
                          const currentTools = plan.tools || [];
                          
                          return (
                            <>
                              {/* 1. Render existing selected tools as dropdowns */}
                              {currentTools.map((selected, idx) => {
                                const gmt = selected.location?.city?.gmt_offset !== undefined ? selected.location.city.gmt_offset : 7;
                                const currentTypeColor = isLab ? "#10b981" : (type === "FIELD" ? "#f59e0b" : "#475569");
                                const currentTypeBg = isLab ? "#f0fdf4" : (type === "FIELD" ? "#fff9eb" : "#f8fafc");

                                return (
                                  <div key={`${selected.code}-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "10px", borderRadius: "10px", border: `1px solid ${currentTypeColor}`, background: currentTypeBg }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                      <select
                                        value={selected.code}
                                        onChange={(e) => {
                                          const newCode = e.target.value;
                                          if (!newCode) {
                                            togglePlanTool(type, plan.aspect_code, selected);
                                          } else {
                                            const newTool = availableTools.find(at => at.code === newCode);
                                            replacePlanTool(type, plan.aspect_code, selected.code, newTool);
                                          }
                                        }}
                                        style={{ flex: 1, padding: "0.4rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: 600, minWidth: 0 }}
                                      >
                                        <option value={selected.code}>{selected.name} ({selected.type})</option>
                                        <option value="">-- Hapus Alat --</option>
                                        {availableTools.filter(at => !currentTools.some(ct => ct.code === at.code)).map(at => (
                                          <option key={at.code} value={at.code}>{at.name} ({at.type})</option>
                                        ))}
                                      </select>
                                      
                                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                                        <button
                                          type="button"
                                          onClick={() => setShowToolGrid({ code: selected.code, name: selected.name, gmt, aspectName: plan.aspect_name, date: plan.scheduled_date })}
                                          style={{ background: "#3b82f6", border: "none", color: "white", fontSize: "0.65rem", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}
                                          title="Cek Ketersediaan Alat"
                                        >
                                          <i className="fas fa-calendar-check"></i> Cek Jadwal
                                        </button>
                                        
                                        <button
                                          type="button"
                                          onClick={() => togglePlanTool(type, plan.aspect_code, selected)}
                                          style={{ background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "0.75rem", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                          title="Batalkan / Hapus Alat"
                                        >
                                          <i className="fas fa-trash-alt"></i>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "0.4rem", marginTop: "0.2rem" }}>
                                      {selected.type === "USAGE" ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>SET JAM:</span>
                                          <select 
                                            value={selected.start_hour} 
                                            onChange={(e) => updatePlanTool(type, plan.aspect_code, selected.code, "start_hour", parseInt(e.target.value))}
                                            style={{ fontSize: "0.75rem", padding: "2px 6px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                                          >
                                            {[...Array(24)].map((_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                                          </select>
                                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8" }}>s/d</span>
                                          <select 
                                            value={selected.end_hour} 
                                            onChange={(e) => updatePlanTool(type, plan.aspect_code, selected.code, "end_hour", parseInt(e.target.value))}
                                            style={{ fontSize: "0.75rem", padding: "2px 6px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                                          >
                                            {[...Array(24)].map((_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                                          </select>
                                        </div>
                                      ) : (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>KUANTITAS (STOCK):</span>
                                          <input 
                                            type="number" 
                                            min="1"
                                            value={selected.quantity} 
                                            onChange={(e) => updatePlanTool(type, plan.aspect_code, selected.code, "quantity", parseInt(e.target.value))}
                                            style={{ width: "60px", fontSize: "0.75rem", padding: "2px 6px", border: "1px solid #cbd5e1", borderRadius: "4px", fontWeight: 700 }}
                                          />
                                          <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 600 }}>
                                            (Tersedia: {Math.max(0, (selected.current_stock || 0) - (selected.min_stock || 0))})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* 2. Render one empty dropdown for adding more tools */}
                              <div style={{ padding: "8px", borderRadius: "10px", border: "1px dashed #cbd5e1", background: "#f8fafc" }}>
                                <select
                                  value=""
                                  onChange={(e) => {
                                    const toolCode = e.target.value;
                                    if (toolCode) {
                                      const tool = availableTools.find(at => at.code === toolCode);
                                      togglePlanTool(type, plan.aspect_code, tool);
                                    }
                                  }}
                                  style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "white", color: "#64748b" }}
                                >
                                  <option value="">+ Tambah Peralatan Uji...</option>
                                  {availableTools.filter(at => !currentTools.some(ct => ct.code === at.code)).map(at => (
                                    <option key={at.code} value={at.code}>{at.name} ({at.type})</option>
                                  ))}
                                </select>
                              </div>

                              {availableTools.length === 0 && (
                                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic", padding: "0.5rem", border: "1px dashed #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
                                  Tidak ada alat tersedia untuk lokasi ini
                                </div>
                              )}
                            </>
                          );
                        })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="planning-form" style={{ paddingBottom: "3rem", minWidth: window.innerWidth < 1024 ? "850px" : "auto" }}>
      {/* Registration Info Panel (Styled to match AppDetail/Verification) */}
      <div className="card" style={{ marginBottom: "1.5rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", padding: "1.25rem", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Registrasi</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b" }}>{app.reg_number}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>App ID (IoT)</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#10b981" }}>{app.id}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Saat Ini</div>
            <span className="badge badge-blue" style={{ fontSize: "0.85rem", padding: "4px 12px", borderRadius: "20px" }}>
              {app.status}
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
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{app.partner?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>KATEGORI PEMOHON</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{app.partner?.type?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>PIC</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{app.partner?.pic_name || "-"}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {app.partner?.pic_email} | {app.partner?.pic_phone}
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
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b" }}>{app.equipment?.equipment_name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>KATEGORI</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{app.equipment?.category?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>NEGARA ASAL</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{app.equipment?.brand?.origin?.name || app.equipment?.brand?.origin_code || "-"}</div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>SPESIFIKASI TEKNIS</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{app.equipment?.technical_spec || "-"}</div>
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
                  {app.package ? `${app.package.package_code} - ${app.package.name}` : "Uji Mandiri (Custom)"}
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
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{app.equipment?.batch_number || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToolGrid && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
          <div style={{ background: "white", borderRadius: "12px", width: "100%", maxWidth: "900px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div>
                <h6 style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Pengecekan Jadwal: {showToolGrid.name}</h6>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Untuk Aspek: {showToolGrid.aspectName} | Tanggal: {showToolGrid.date || "Sesuai Jadwal"} (GMT{showToolGrid.gmt >= 0 ? "+" : ""}{showToolGrid.gmt})</div>
              </div>
              <button onClick={() => setShowToolGrid(null)} style={{ border: "none", background: "none", color: "#64748b", fontSize: "1.25rem", cursor: "pointer" }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              <ToolAvailabilityGrid 
                toolCode={showToolGrid.code} 
                date={showToolGrid.date || new Date().toISOString().split('T')[0]} 
                gmtOffset={showToolGrid.gmt}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {renderPlanSection("LAB")}
        {renderPlanSection("FIELD")}
        {renderPlanSection("MANAG")}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "2.5rem",
          padding: "1rem",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
          position: "sticky",
          bottom: "-2rem",
          zIndex: 10,
        }}
      >
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ padding: "10px 25px" }}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: "10px 30px", fontWeight: 700 }}>
          {submitting ? "Menyimpan..." : "Finalisasi & Simpan Semua Rencana"}
        </button>
      </div>
    </form>
  );
};

export default PlanningForm;
