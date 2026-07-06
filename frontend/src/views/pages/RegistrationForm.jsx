import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import PartnerSearchModal from "@components/PartnerSearchModal";
import { useToast } from '@context/ToastContext';

const RegistrationForm = ({ onSuccess, onCancel, currentFilters }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    equipment_id: "",
    partner_id: "",
    month: currentFilters.month,
    year: currentFilters.year,
    count: 1
  });

  const [masterData, setMasterData] = useState({
    equipments: []
  });

  const [loading, setLoading] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchMaster();
  }, []);

  const fetchMaster = async () => {
    setLoading(true);
    try {
      const e = await apiRequest("/equipments");
      setMasterData({ equipments: e || [] });
    } catch (err) {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/applications", "POST", formData);
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pengajuan', 'error');
    }
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading Master Data...</div>;

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Outfit", margin: 0 }}>Registrasi Pengajuan Baru</h2>
          <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
          
          <div style={{ marginBottom: "1.5rem" }}>
             <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "700" }}>Nama Peralatan</label>
             <select className="form-control" required value={formData.equipment_id} onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}>
                <option value="">-- Pilih Peralatan --</option>
                {masterData.equipments.map(e => <option key={e.id} value={e.id}>{e.equipment_name} ({e.brand?.brand_name})</option>)}
             </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
             <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "700" }}>Nama Pemohon (Partner)</label>
             <div style={{ display: "flex", gap: "8px" }}>
               <input 
                 type="text" 
                 className="form-control" 
                 value={selectedPartner ? `${selectedPartner.code} - ${selectedPartner.name}` : ""} 
                 placeholder="Klik tombol cari..." 
                 readOnly 
                 required
                 style={{ flex: 1, backgroundColor: "#f8fafc" }}
               />
               <button 
                 type="button" 
                 className="btn btn-primary" 
                 onClick={() => setIsPartnerModalOpen(true)}
                 style={{ padding: "0 15px", borderRadius: "10px" }}
               >
                 <i className="fas fa-search"></i>
               </button>
             </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
             <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "700" }}>Jumlah Unit</label>
             <input type="number" className="form-control" min="1" max="10" value={formData.count} onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})} />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
             <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2.5rem", fontSize: "1rem" }}>
               Daftarkan Sekarang
             </button>
             <button type="button" className="btn btn-secondary" style={{ padding: "0.8rem 2.5rem", fontSize: "1rem" }} onClick={onCancel}>
               Batal
             </button>
          </div>
        </form>
      </div>

      <PartnerSearchModal 
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSelect={(p) => {
          setSelectedPartner(p);
          setFormData(prev => ({ ...prev, partner_id: p.id }));
        }}
      />
    </>
  );
};

export default RegistrationForm;
