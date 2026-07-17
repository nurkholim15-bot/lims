import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const MasterForm = ({ item, initialData, endpoint, crudEndpoint, onSuccess, onCancel, checkPasswordRequirement }) => {
  const { showToast } = useToast();
  const baseEndpoint = (endpoint || "").split("?")[0];
  const isNew = !item;

  const getInitialData = () => {
    let defaults = {};
    if (baseEndpoint === "/tester-masters") defaults = { tester_id: "", name: "", position: "", methodology_code: "" };
    else if (baseEndpoint === "/locations") defaults = { code: "", name: "", city_code: "", test_type_code: "" };
    else if (baseEndpoint === "/methodologies") defaults = { code: "", name: "", test_type_code: "", scoring_level_code: "00000" };
    else if (baseEndpoint === "/partners") defaults = { id: "", name: "", type_code: "", alamat: "", city_code: "", pic_name: "", pic_email: "", pic_phone: "" };
    else if (baseEndpoint === "/partner-types") defaults = { code: "", name: "" };
    else if (baseEndpoint === "/test-standards") defaults = { code: "", name: "", description: "" };
    else if (baseEndpoint === "/user-sessions") defaults = { id: "", user_id: "", token: "", ip_address: "" };
    else if (baseEndpoint === "/global-parameters") defaults = { param_key: "", param_value: "", description: "" };
    else if (baseEndpoint === "/models") defaults = { code: "", name: "", brand_code: "" };
    else if (baseEndpoint === "/variants") defaults = { code: "", name: "", model_code: "" };
    else if (baseEndpoint === "/users") defaults = { username: "", email: "", phone: "", role_id: "", password: "", telegram_chat_id: "", whatsapp_phone: "", teams_user_id: "", force_pwd_change: false, is_active: true };
    else if (baseEndpoint === "/scoring-aspects") defaults = { code: "", name: "", methodology_code: "", weight: 0, is_used: true };
    else if (baseEndpoint === "/scoring-sub-aspects") defaults = { code: "", name: "", aspect_code: "", weight: 0, is_simulator: false, ocr_keywords: "" };
    else if (baseEndpoint === "/scoring-sub-aspect-items") defaults = { id: "", sub_aspect_code: "", name: "", score: 0 };
    else if (baseEndpoint === "/asset-statuses") defaults = { asset_status_code: "", asset_status_name: "" };
    else if (baseEndpoint === "/status-applications") defaults = { status_code: "", desc: "" };
    else if (baseEndpoint === "/provinces") defaults = { province_code: "", province_name: "" };
    else if (baseEndpoint === "/cities") defaults = { city_code: "", city_name: "", province_code: "", gmt_offset: 7 };
    else if (baseEndpoint === "/testing-tools") defaults = { code: "", name: "", type: "USAGE", initial_stock: 0, current_stock: 0, min_stock: 0, location_code: "" };
    else if (baseEndpoint === "/brands") defaults = { code: "", name: "", material_category_code: "", origin_code: "" };
    else if (baseEndpoint === "/testing-packages") {
      defaults = { 
        package_code: "", 
        name: "", 
        description: "", 
        base_price: 0, 
        is_active: true, 
        methodology_codes: [],
        active_aspect_codes: [],
        active_sub_aspect_codes: []
      };
    }
    else if (baseEndpoint === "/scoring-levels") defaults = { level_group_code: "", min_score: 0, max_score: 0, label: "", description: "" };
    else defaults = { code: "", name: "" };

    let result = { ...defaults };
    
    // Merge with either the item being edited OR the predefined initial data
    if (item) {
        result = { ...result, ...item };
        if (baseEndpoint === "/testing-packages") {
          if (item.methodologies) {
            result.methodology_codes = item.methodologies.map(m => m.code);
          } else {
            result.methodology_codes = result.methodology_codes || [];
          }
          if (item.active_aspects) {
            result.active_aspect_codes = item.active_aspects.map(a => a.code);
          } else {
            result.active_aspect_codes = [];
          }
          if (item.active_sub_aspects) {
            result.active_sub_aspect_codes = item.active_sub_aspects.map(s => s.code);
          } else {
            result.active_sub_aspect_codes = [];
          }
        }
    } else if (initialData) {
        result = { ...result, ...initialData };
    }

    // For menus, specialized mapping
    if (baseEndpoint === "/all-menus") {
      result = {
        id: result?.id || "",
        parent_id: result?.parent_id || 0,
        title: result?.title || "",
        icon: result?.icon || "",
        path: result?.path || "",
        order: result?.order || 0,
        is_password: typeof result?.is_password === "boolean" ? result.is_password : false,
        created_at: result?.created_at || "",
        updated_at: result?.updated_at || "",
        created_user: result?.created_user || "",
        updated_user: result?.updated_user || "",
      };
    }
    
    return result;
  };
  
  const [formData, setFormData] = useState(getInitialData());
  const [methodologies, setMethodologies] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [aspectsList, setAspectsList] = useState([]);
  const [subAspectsList, setSubAspectsList] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityPage, setCityPage] = useState(1);
  const [totalCities, setTotalCities] = useState(0);
  const [cityLimit] = useState(50);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (baseEndpoint === "/users") {
          const data = await apiRequest("/roles?dropdown=1");
          if (data) setRoles(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/tester-masters" || baseEndpoint === "/scoring-aspects") {
          const data = await apiRequest("/methodologies?dropdown=1");
          if (data) setMethodologies(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/locations" || baseEndpoint === "/methodologies" || baseEndpoint === "/testing-packages") {
          const data = await apiRequest("/test-types?dropdown=1");
          if (data) setTestTypes(Array.isArray(data) ? data : (data.data || []));
          
          if (baseEndpoint === "/testing-packages") {
            const [mData, aData, saData] = await Promise.all([
              apiRequest("/methodologies?dropdown=1"),
              apiRequest("/scoring-aspects?limit=500"),
              apiRequest("/scoring-sub-aspects?limit=1000")
            ]);
            if (mData) setMethodologies(Array.isArray(mData) ? mData : (mData.data || []));
            if (aData) setAspectsList(Array.isArray(aData) ? aData : (aData.data || []));
            if (saData) setSubAspectsList(Array.isArray(saData) ? saData : (saData.data || []));
          }
        }
        if (baseEndpoint === "/models") {
          const data = await apiRequest("/brands?dropdown=1");
          if (data) setBrands(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/variants") {
          const data = await apiRequest("/models?dropdown=1");
          if (data) setModelsList(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/partners") {
          const types = await apiRequest("/partner-types?dropdown=1");
          if (types) setPartnerTypes(Array.isArray(types) ? types : (types.data || []));
        }
        if (baseEndpoint === "/scoring-sub-aspects") {
          const data = await apiRequest("/scoring-aspects?dropdown=1");
          if (data) setAspectsList(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/scoring-sub-aspect-items") {
          const data = await apiRequest("/scoring-sub-aspects?dropdown=1");
          if (data) setAspectsList(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/scoring-levels") {
          const data = await apiRequest("/methodologies?dropdown=1");
          if (data) setMethodologies(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/methodologies") {
          const ldata = await apiRequest("/scoring-levels?dropdown=1");
          if (ldata) {
            const raw = Array.isArray(ldata) ? ldata : (ldata.data || []);
            const uniqueGroups = [...new Set(raw.map((l) => l.level_group_code))];
            setAspectsList(uniqueGroups.map((g) => ({ code: g, name: g === "00000" ? "00000 (General)" : g })));
          }
          const tdata = await apiRequest("/test-types?dropdown=1");
          if (tdata) setTestTypes(Array.isArray(tdata) ? tdata : (tdata.data || []));
        }
        
        if (baseEndpoint === "/testing-tools" || baseEndpoint === "/locations") {
          const locs = await apiRequest("/locations?dropdown=1");
          const ttypes = await apiRequest("/test-types?dropdown=1");
          if (locs) setLocationsList(Array.isArray(locs) ? locs : (locs.data || []));
          if (ttypes) setTestTypes(Array.isArray(ttypes) ? ttypes : (ttypes.data || []));
        }

        if (baseEndpoint === "/testing-tools" || baseEndpoint === "/locations" || baseEndpoint === "/partners") {
          const ctsRes = await apiRequest(`/cities?page=${cityPage}&limit=${cityLimit}&dropdown=1`);
          if (ctsRes) {
            setCities(ctsRes.data || []);
            if (ctsRes.metadata) setTotalCities(ctsRes.metadata.total_records);
          }
        }
        if (baseEndpoint === "/cities") {
          const data = await apiRequest("/provinces?dropdown=1");
          if (data) setProvinces(Array.isArray(data) ? data : (data.data || []));
        }
        if (baseEndpoint === "/brands") {
          const [oData, mData] = await Promise.all([
            apiRequest("/origins?dropdown=1"),
            apiRequest("/material-categories?dropdown=1")
          ]);
          if (oData) setOrigins(Array.isArray(oData) ? oData : (oData.data || []));
          if (mData) setMaterialCategories(Array.isArray(mData) ? mData : (mData.data || []));
        }
      } catch (err) {
        console.error("MasterForm fetch dependencies error:", err);
      }
    };
    fetchAllData();
  }, [baseEndpoint, cityPage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkPasswordRequirement) {
      checkPasswordRequirement(performSubmit, baseEndpoint);
    } else {
      await performSubmit();
    }
  };

  const performSubmit = async () => {
    setLoading(true);
    try {
      const idField = item ? item.id || item.status_code || item.tester_id || item.code || item.city_code || item.province_code || item.asset_status_code : null;
      const processedData = { ...formData };
      
      if (processedData.weight !== undefined && processedData.weight !== "") processedData.weight = parseFloat(processedData.weight);
      if (processedData.pass_threshold !== undefined && processedData.pass_threshold !== "") processedData.pass_threshold = parseFloat(processedData.pass_threshold);
      if (processedData.note_threshold !== undefined && processedData.note_threshold !== "") processedData.note_threshold = parseFloat(processedData.note_threshold);
      if (processedData.threshold !== undefined && processedData.threshold !== "") processedData.threshold = parseFloat(processedData.threshold);
      if (processedData.score !== undefined && processedData.score !== "") processedData.score = parseFloat(processedData.score);
      if (processedData.base_price !== undefined && processedData.base_price !== "") processedData.base_price = parseFloat(processedData.base_price);
      if (processedData.price !== undefined && processedData.price !== "") processedData.price = parseFloat(processedData.price);
      if (processedData.min_score !== undefined && processedData.min_score !== "") processedData.min_score = parseFloat(processedData.min_score);
      if (processedData.max_score !== undefined && processedData.max_score !== "") processedData.max_score = parseFloat(processedData.max_score);
      if (processedData.role_id !== undefined) processedData.role_id = processedData.role_id === "" ? 0 : parseInt(processedData.role_id);
      if (processedData.order !== undefined) processedData.order = processedData.order === "" ? 0 : parseInt(processedData.order);
      if (processedData.parent_id !== undefined) processedData.parent_id = processedData.parent_id === "" ? 0 : parseInt(processedData.parent_id);
      if (processedData.gmt_offset !== undefined) processedData.gmt_offset = processedData.gmt_offset === "" ? 7 : parseInt(processedData.gmt_offset);
      if (processedData.min_stock !== undefined) processedData.min_stock = processedData.min_stock === "" ? 0 : parseInt(processedData.min_stock);
      if (processedData.location_code === "") processedData.location_code = null;
      if (processedData.city_code === "") processedData.city_code = null;

      Object.keys(processedData).forEach((key) => {
        if (processedData[key] !== null && typeof processedData[key] === "object" && !Array.isArray(processedData[key])) {
          delete processedData[key];
        }
      });

      if (isNew) {
        delete processedData.id;
        delete processedData.created_at;
        delete processedData.updated_at;
        delete processedData.created_user;
        delete processedData.updated_user;
        delete processedData.deleted_user;
      }

      const writeEndpoint = crudEndpoint || endpoint;

      if (isNew) {
        await apiRequest(writeEndpoint, "POST", processedData);
      } else {
        await apiRequest(`${writeEndpoint}/${idField}`, "PUT", processedData);
      }
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isRequired = (key) => {
    if (["code", "name", "status_code", "city_code", "province_code", "location_code", "test_type_code", "tester_id", "type", "package_code"].includes(key)) return true;
    if (baseEndpoint === "/cities" && key === "city_name") return true;
    return false;
  };

  const isCompact = ["/partners", "/tester-masters", "/users", "/testing-packages"].includes(baseEndpoint);

  const renderField = (key, label, inputComponent, required = false, fullWidth = false) => {
    if (isCompact) {
      return (
        <div 
          key={key} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1.5rem", 
            gridColumn: fullWidth ? "span 2" : "span 1",
            padding: "0.25rem 0"
          }}
        >
          <label style={{ 
            fontWeight: 600, 
            fontSize: "0.875rem", 
            color: "#475569", 
            width: "140px", 
            flexShrink: 0,
            whiteSpace: "nowrap"
          }}>
            {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
          <div style={{ flex: 1 }}>
            {inputComponent}
          </div>
        </div>
      );
    }

    return (
      <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </label>
        {inputComponent}
      </div>
    );
  };

  const inputStyle = {
    padding: "0.625rem 0.875rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    width: "100%",
    fontSize: "0.875rem",
    transition: "all 0.2s",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#fcfcfd"
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
    e.target.style.backgroundColor = "#fff";
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
    e.target.style.backgroundColor = "#fcfcfd";
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={isCompact ? { 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "1.5rem 3rem",
        padding: "0.5rem"
      } : { 
        display: "flex", 
        flexDirection: "column", 
        gap: "1rem" 
      }}>
        {Object.keys(formData).map((key) => {
          const lowerKey = key.toLowerCase().trim();
          if (
            ["created_at", "updated_at", "created_user", "updated_user", "deleted_at", "deleted_user", "deleteduser", "id", "methodology", "test_type", "category", "brand", "model", "last_pwd_change", "role_name", "active_aspect_codes", "active_sub_aspect_codes"].includes(lowerKey) ||
            (baseEndpoint === "/testing-tools" && ["initial_stock", "current_stock"].includes(lowerKey)) ||
            (formData[key] !== null && typeof formData[key] === "object" && key !== "methodology_codes")
          )
            return null;

          const required = isRequired(key);
          const isFullWidth = key === "alamat" || key === "description" || key === "notes" || key === "param_value" || key === "purpose" || key === "ocr_keywords";

          if ((baseEndpoint === "/all-menus" || baseEndpoint === "/status-applications") && ["code", "name"].includes(key)) return null;

          if (baseEndpoint === "/methodologies" && key === "test_type_code") {
            return renderField(key, "Jenis Uji", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} required={required} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Jenis Uji --</option>
                {Array.isArray(testTypes) && testTypes.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }

          if (baseEndpoint === "/all-menus" && key === "parent_id") {
            return renderField(key, "Parent Menu ID", (
              <input type="number" name={key} value={formData[key] || 0} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (baseEndpoint === "/all-menus" && key === "title") {
            return renderField(key, "Menu Title", (
              <input type="text" name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (baseEndpoint === "/all-menus" && key === "icon") {
            return renderField(key, "Icon", (
              <input type="text" name={key} value={formData[key] || ""} onChange={handleChange} placeholder="e.g., fas fa-home" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (baseEndpoint === "/all-menus" && key === "path") {
            return renderField(key, "Router Path", (
              <input type="text" name={key} value={formData[key] || ""} onChange={handleChange} placeholder="e.g., /dashboard" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (baseEndpoint === "/all-menus" && key === "order") {
            return renderField(key, "Display Order", (
              <input type="number" name={key} value={formData[key] || 0} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (baseEndpoint === "/all-menus" && key === "is_password") {
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "1rem", gridColumn: "span 2", padding: "0.5rem 0" }}>
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                <label style={{ fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", color: "#475569" }}>Require Password for This Menu</label>
              </div>
            );
          }
          if (key === "role_id") {
            return renderField(key, "Role ID", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Role --</option>
                {Array.isArray(roles) && roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }

          if (key === "methodology_code" || key === "methodologies_code") {
            const fieldLabel = "Methodology";
            return renderField(key, fieldLabel, (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Generic / Select --</option>
                <option value="00000">00000 (General / Catch-all)</option>
                {Array.isArray(methodologies) && methodologies.map((m) => (
                  <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }

          if (key === "level_group_code") {
            const fieldLabel = "Scoring Level Set";
            return renderField(key, fieldLabel, (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Group --</option>
                <option value="00000">00000 - GENERAL / DEFAULT</option>
                <option value="ALUTSISTA">ALUTSISTA - Standar Penilaian Alutsista</option>
                <option value="PERSONEL">PERSONEL - Standar Penilaian Personel</option>
                <option value="INTEGRATED">INTEGRATED - Standar Penilaian Terintegrasi</option>
              </select>
            ), required, isFullWidth);
          }
          if (key === "scoring_level_code") {
            return renderField(key, "Scoring Level Group", (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">-- Select Rule Set --</option>
                  <option value="00000">00000 (General)</option>
                  {Array.isArray(aspectsList) && aspectsList.map((g) => (
                    <option key={g.code} value={g.code}>{g.name}</option>
                  ))}
                </select>
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Metodologi ini akan menggunakan rentang nilai & label dari grup level ini.</small>
              </div>
            ), required, isFullWidth);
          }
          if (key === "test_type_code") {
            return renderField(key, "Test Type", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Test Type --</option>
                {Array.isArray(testTypes) && testTypes.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "brand_code") {
            return renderField(key, "Brand", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Brand --</option>
                {Array.isArray(brands) && brands.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "model_code") {
            return renderField(key, "Model", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Model --</option>
                {Array.isArray(modelsList) && modelsList.map((m) => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "type_code") {
            return renderField(key, "Tipe Rekanan", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Tipe --</option>
                {Array.isArray(partnerTypes) && partnerTypes.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "pic_name" || key === "pic_email" || key === "pic_phone") {
            const labels = { pic_name: "Nama PIC", pic_email: "Email PIC", pic_phone: "No. Telp PIC" };
            return renderField(key, labels[key], (
              <input type={key === "pic_email" ? "email" : "text"} name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            ), required, isFullWidth);
          }
          if (key === "ocr_keywords") {
            return renderField(key, "Kata Kunci OCR", (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <input type="text" name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} placeholder="e.g. frekuensi, freq, freq. hz" />
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Kata kunci pembanding untuk mendeteksi hasil uji dari file dokumen (pisahkan dengan tanda koma).</small>
              </div>
            ), required, isFullWidth);
          }
          if (baseEndpoint !== "/provinces" && key === "province_code") {
            return renderField(key, "Province", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} required={required} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Province --</option>
                {Array.isArray(provinces) && provinces.map((p) => (
                  <option key={p.province_code} value={p.province_code}>{p.province_name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (baseEndpoint !== "/cities" && key === "city_code") {
            const totalPages = Math.ceil(totalCities / cityLimit);
            return renderField(key, "City", (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <select name={key} value={formData[key] || ""} onChange={handleChange} required={required} style={{ ...inputStyle, flex: 1 }} onFocus={focusStyle} onBlur={blurStyle}>
                    <option value="">-- Select City --</option>
                    {Array.isArray(cities) && cities.map((c) => (
                      <option key={c.city_code} value={c.city_code}>
                        {c.city_name} {c.province ? `(${c.province.province_name})` : ""}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button type="button" onClick={() => setCityPage(p => Math.max(1, p - 1))} disabled={cityPage <= 1} className="btn btn-sm btn-secondary" style={{ padding: "0.4rem 0.6rem" }}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button type="button" onClick={() => setCityPage(p => Math.min(totalPages, p + 1))} disabled={cityPage >= totalPages} className="btn btn-sm btn-secondary" style={{ padding: "0.4rem 0.6rem" }}>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                {totalPages > 1 && (
                  <small style={{ color: "#64748b", textAlign: "right", fontSize: "0.7rem" }}>
                    Halaman {cityPage} / {totalPages} ({totalCities} total)
                  </small>
                )}
              </div>
            ), required, isFullWidth);
          }
          if (key === "aspect_code" || (baseEndpoint === "/scoring-sub-aspects" && key === "aspect_code")) {
            return renderField(key, "Aspek Scoring", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Aspek --</option>
                {Array.isArray(aspectsList) && aspectsList.map((a) => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "sub_aspect_code" || (baseEndpoint === "/scoring-sub-aspect-items" && key === "sub_aspect_code")) {
            const isPredefined = !isNew || (formData[key] && formData[key] !== "");
            if (isPredefined && baseEndpoint === "/scoring-sub-aspect-items") {
               const selectedSubAspect = Array.isArray(aspectsList) && aspectsList.find(a => a.code === formData[key]);
               const displayName = selectedSubAspect ? `${selectedSubAspect.code} - ${selectedSubAspect.name}` : formData[key];
               return renderField(key, "Sub-Aspek Scoring", (
                 <input type="text" value={displayName} readOnly style={{ ...inputStyle, background: "#f8fafc", color: "#64748b", fontWeight: 500 }} />
               ), required, isFullWidth);
            }
            return renderField(key, "Sub-Aspek Scoring", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Sub-Aspek --</option>
                {Array.isArray(aspectsList) && aspectsList.map((a) => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "is_simulator") {
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "1rem", gridColumn: "span 2", padding: "0.5rem 0" }}>
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
                <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#475569" }}>Is Simulator (Data uploaded automatically from IoT)</label>
              </div>
            );
          }
          if (key === "is_used") {
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "1rem", gridColumn: "span 2", padding: "0.5rem 0" }}>
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
                <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#475569" }}>Is Used (Visible in Planning UI)</label>
              </div>
            );
          }
          if (key === "type" && baseEndpoint === "/testing-tools") {
            return renderField(key, "Tipe Alat", (
              <select name={key} value={formData[key] || "USAGE"} onChange={handleChange} required={required} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="USAGE">USAGE (Booking per Jam)</option>
                <option value="STOCK">STOCK (Potong Kuantitas)</option>
              </select>
            ), required, isFullWidth);
          }
          if (key === "min_stock" && baseEndpoint === "/testing-tools" && formData.type === "USAGE") return null;
          if (key === "location_code" && baseEndpoint === "/testing-tools") {
            return renderField(key, "Lokasi", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} required={required} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Lokasi --</option>
                {Array.isArray(locationsList) && locationsList.map((l) => (
                  <option key={l.code} value={l.code}>{l.name} (GMT{l.city?.gmt_offset !== undefined ? (l.city.gmt_offset >= 0 ? `+${l.city.gmt_offset}` : l.city.gmt_offset) : "+7"})</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "gmt_offset" && baseEndpoint === "/cities") {
            return renderField(key, "Zone (GMT Offset)", (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <input type="number" name={key} value={formData[key] || 0} onChange={handleChange} placeholder="e.g. 7 for WIB, 8 for WITA" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>WIB = 7, WITA = 8, WIT = 9</small>
              </div>
            ), required, isFullWidth);
          }
          if (key === "material_category_code") {
            return renderField(key, "Kategori Material", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Kategori --</option>
                {Array.isArray(materialCategories) && materialCategories.map((m) => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }
          if (key === "origin_code") {
            return renderField(key, "Negara / Origin", (
              <select name={key} value={formData[key] || ""} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Pilih Negara --</option>
                {Array.isArray(origins) && origins.map((o) => (
                  <option key={o.code} value={o.code}>{o.name}</option>
                ))}
              </select>
            ), required, isFullWidth);
          }

          if (key === "methodology_codes" && baseEndpoint === "/testing-packages") {
            // Group methodologies by type
            const labMets = methodologies.filter(m => (m.test_type_code || "").toUpperCase() === "LAB");
            const fieldMets = methodologies.filter(m => ["FIELD", "FLD", "LAPANGAN"].includes((m.test_type_code || "").toUpperCase()));
            const generalMets = methodologies.filter(m => {
              const tc = (m.test_type_code || "").toUpperCase();
              return tc !== "LAB" && tc !== "FIELD" && tc !== "FLD" && tc !== "LAPANGAN";
            });

            // Helper to render tree for a methodology
            const renderMethodologyTree = (m) => {
              const isChecked = (formData.methodology_codes || []).includes(m.code);
              
              // Filter aspects and sub-aspects belonging to this methodology
              const mAspects = aspectsList.filter(a => a.methodology_code === m.code);

              return (
                <div key={m.code} style={{ marginBottom: "1rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input 
                      type="checkbox" 
                      id={`m-${m.code}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const codes = [...(formData.methodology_codes || [])];
                        let activeAspects = [...(formData.active_aspect_codes || [])];
                        let activeSubAspects = [...(formData.active_sub_aspect_codes || [])];
                        
                        if (e.target.checked) {
                          codes.push(m.code);
                          // Auto check all child aspects and sub-aspects by default
                          mAspects.forEach(a => {
                            if (!activeAspects.includes(a.code)) activeAspects.push(a.code);
                            const aSubs = subAspectsList.filter(s => s.aspect_code === a.code);
                            aSubs.forEach(s => {
                              if (!activeSubAspects.includes(s.code)) activeSubAspects.push(s.code);
                            });
                          });
                        } else {
                          const idx = codes.indexOf(m.code);
                          if (idx > -1) codes.splice(idx, 1);
                          // Auto uncheck all child aspects and sub-aspects
                          mAspects.forEach(a => {
                            const aIdx = activeAspects.indexOf(a.code);
                            if (aIdx > -1) activeAspects.splice(aIdx, 1);
                            const aSubs = subAspectsList.filter(s => s.aspect_code === a.code);
                            aSubs.forEach(s => {
                              const sIdx = activeSubAspects.indexOf(s.code);
                              if (sIdx > -1) activeSubAspects.splice(sIdx, 1);
                            });
                          });
                        }
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          methodology_codes: codes,
                          active_aspect_codes: activeAspects,
                          active_sub_aspect_codes: activeSubAspects
                        }));
                      }}
                    />
                    <label htmlFor={`m-${m.code}`} style={{ fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", color: "#1e293b" }}>
                      {m.code} - {m.name}
                    </label>
                  </div>

                  {isChecked && mAspects.length > 0 && (
                    <div style={{ marginLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {mAspects.map(aspect => {
                        const isAspectChecked = (formData.active_aspect_codes || []).includes(aspect.code);
                        const aSubs = subAspectsList.filter(s => s.aspect_code === aspect.code);

                        return (
                          <div key={aspect.code} style={{ padding: "0.25rem", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input 
                                type="checkbox"
                                id={`asp-${aspect.code}`}
                                checked={isAspectChecked}
                                onChange={(e) => {
                                  let activeAspects = [...(formData.active_aspect_codes || [])];
                                  let activeSubAspects = [...(formData.active_sub_aspect_codes || [])];

                                  if (e.target.checked) {
                                    if (!activeAspects.includes(aspect.code)) activeAspects.push(aspect.code);
                                    // Auto check all sub-aspects
                                    aSubs.forEach(s => {
                                      if (!activeSubAspects.includes(s.code)) activeSubAspects.push(s.code);
                                    });
                                  } else {
                                    const aIdx = activeAspects.indexOf(aspect.code);
                                    if (aIdx > -1) activeAspects.splice(aIdx, 1);
                                    // Auto uncheck all sub-aspects
                                    aSubs.forEach(s => {
                                      const sIdx = activeSubAspects.indexOf(s.code);
                                      if (sIdx > -1) activeSubAspects.splice(sIdx, 1);
                                    });
                                  }

                                  setFormData(prev => ({ 
                                    ...prev, 
                                    active_aspect_codes: activeAspects,
                                    active_sub_aspect_codes: activeSubAspects
                                  }));
                                }}
                              />
                              <label htmlFor={`asp-${aspect.code}`} style={{ fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", color: "#334155" }}>
                                {aspect.code} - {aspect.name}
                              </label>
                            </div>

                            {isAspectChecked && aSubs.length > 0 && (
                              <div style={{ marginLeft: "1.25rem", marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                {aSubs.map(sub => {
                                  const isSubChecked = (formData.active_sub_aspect_codes || []).includes(sub.code);

                                  return (
                                    <div key={sub.code} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                      <input 
                                        type="checkbox"
                                        id={`sub-${sub.code}`}
                                        checked={isSubChecked}
                                        onChange={(e) => {
                                          let activeAspects = [...(formData.active_aspect_codes || [])];
                                          let activeSubAspects = [...(formData.active_sub_aspect_codes || [])];

                                          if (e.target.checked) {
                                            if (!activeSubAspects.includes(sub.code)) activeSubAspects.push(sub.code);
                                            // Ensure parent aspect is checked
                                            if (!activeAspects.includes(aspect.code)) activeAspects.push(aspect.code);
                                          } else {
                                            const sIdx = activeSubAspects.indexOf(sub.code);
                                            if (sIdx > -1) activeSubAspects.splice(sIdx, 1);
                                          }

                                          setFormData(prev => ({ 
                                            ...prev, 
                                            active_aspect_codes: activeAspects,
                                            active_sub_aspect_codes: activeSubAspects
                                          }));
                                        }}
                                      />
                                      <label htmlFor={`sub-${sub.code}`} style={{ fontSize: "0.75rem", cursor: "pointer", color: "#64748b" }}>
                                        {sub.code} - {sub.name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            };

            const isDefaultFallback = (formData.active_aspect_codes || []).length === 0;

            return renderField(key, "Konfigurasi Metodologi & Parameter Uji", (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {isDefaultFallback && (
                  <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", color: "#b45309", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fas fa-exclamation-triangle"></i> Seluruh parameter uji aktif secara default (Sistem Fallback)
                  </div>
                )}
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  {/* Column 1: Uji Laboratorium */}
                  <div style={{ border: "1px solid #bcf0da", borderRadius: "12px", padding: "1rem", backgroundColor: "#f0fdf4", height: "fit-content", minHeight: "200px" }}>
                    <h4 style={{ color: "#166534", fontSize: "0.9rem", fontWeight: 800, borderBottom: "1px solid #bcf0da", paddingBottom: "0.5rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fas fa-flask"></i> Uji Laboratorium
                    </h4>
                    {labMets.length === 0 ? (
                      <div style={{ fontSize: "0.75rem", color: "#166534", fontStyle: "italic" }}>Tidak ada metodologi Lab</div>
                    ) : (
                      labMets.map(renderMethodologyTree)
                    )}
                  </div>

                  {/* Column 2: Uji Lapangan */}
                  <div style={{ border: "1px solid #fef3c7", borderRadius: "12px", padding: "1rem", backgroundColor: "#fff9eb", height: "fit-content", minHeight: "200px" }}>
                    <h4 style={{ color: "#92400e", fontSize: "0.9rem", fontWeight: 800, borderBottom: "1px solid #fef3c7", paddingBottom: "0.5rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fas fa-mountain"></i> Uji Lapangan
                    </h4>
                    {fieldMets.length === 0 ? (
                      <div style={{ fontSize: "0.75rem", color: "#92400e", fontStyle: "italic" }}>Tidak ada metodologi Lapangan</div>
                    ) : (
                      fieldMets.map(renderMethodologyTree)
                    )}
                  </div>

                  {/* Column 3: Uji Umum */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem", backgroundColor: "#f8fafc", height: "fit-content", minHeight: "200px" }}>
                    <h4 style={{ color: "#334155", fontSize: "0.9rem", fontWeight: 800, borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fas fa-tasks"></i> Uji Umum
                    </h4>
                    {generalMets.length === 0 ? (
                      <div style={{ fontSize: "0.75rem", color: "#475569", fontStyle: "italic" }}>Tidak ada metodologi Umum</div>
                    ) : (
                      generalMets.map(renderMethodologyTree)
                    )}
                  </div>
                </div>
              </div>
            ), required, true);
          }

          if (key === "is_active" && (baseEndpoint === "/testing-packages" || baseEndpoint === "/users")) {
            return renderField(key, "Status Aktif", (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" name={key} checked={formData[key] !== false} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{formData[key] !== false ? "Aktif" : "Non-Aktif"}</span>
              </div>
            ), required, isFullWidth);
          }

          if (key === "force_pwd_change") {
            return renderField(key, "Force Pwd Change", (
              <div style={{ display: "flex", alignItems: "center", height: "38px" }}>
                <input 
                  type="checkbox" 
                  name={key} 
                  checked={!!formData[key]} 
                  onChange={handleChange} 
                  style={{ width: "20px", height: "20px", cursor: "pointer" }} 
                />
              </div>
            ), false, false);
          }

          let fieldLabel = key === "weight" ? "Bobot (%)" : key === "id" ? "ID" : key.replace(/_/g, " ");
          if (key === "telegram_chat_id") fieldLabel = "Telegram Chat ID";
          else if (key === "whatsapp_phone") fieldLabel = "WhatsApp Phone";
          else if (key === "teams_user_id") fieldLabel = "MS Teams User ID";
          else if (key === "min_score") fieldLabel = "Skor Min";
          else if (key === "max_score") fieldLabel = "Skor Max";
          else if (key === "label") fieldLabel = "Label";
          else if (key === "description") fieldLabel = "Deskripsi";
          
          if (key === "param_value" || key === "description" || key === "alamat") {
            return renderField(key, fieldLabel, (
              <textarea
                name={key}
                value={formData[key] || ""}
                onChange={handleChange}
                required={required}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                placeholder={`Masukkan ${fieldLabel.toLowerCase()}`}
              />
            ), required, isFullWidth);
          }

          const inputType = ["weight", "pass_threshold", "note_threshold", "score", "order", "parent_id", "min_stock", "initial_stock", "current_stock"].includes(key) ? "number" : typeof formData[key] === "number" ? "number" : "text";

          return renderField(key, fieldLabel, (
            <input
              type={inputType}
              step={["weight", "pass_threshold", "note_threshold", "score"].includes(key) ? "0.01" : undefined}
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
              required={required}
              disabled={!isNew && (key === "code" || key === "status_code" || key === "tester_id" || key === "param_key" || key === "id" || key === "asset_status_code" || key === "province_code" || key === "city_code")}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
              placeholder={`Masukkan ${fieldLabel.toLowerCase()}`}
            />
          ), required, isFullWidth);
        })}
      </div>
      
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        gap: "1rem", 
        marginTop: "1.5rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid #f1f5f9"
      }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading} style={{ padding: "0.625rem 1.5rem", borderRadius: "8px", fontWeight: 600 }}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.625rem 2rem", borderRadius: "8px", fontWeight: 700, backgroundColor: "#10b981", borderColor: "#10b981" }}>
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>
    </form>
  );
};

export default MasterForm;
