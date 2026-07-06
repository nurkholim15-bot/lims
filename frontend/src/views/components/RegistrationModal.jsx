import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const RegistrationModal = ({ isOpen, onClose, onRefresh, currentFilters, appConfig }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        equipment_id: "",
        partner_id: "",
        count: 1
    });

    const [masterData, setMasterData] = useState({
        partners: [],
        equipments: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchMaster();
            setFormData({
                equipment_id: "",
                partner_id: "",
                count: 1
            });
        }
    }, [isOpen]);

    const fetchMaster = async () => {
        try {
            const [p, e] = await Promise.all([
                apiRequest("/partners"),
                apiRequest("/equipments")
            ]);
            setMasterData({ partners: p || [], equipments: e || [] });
        } catch (err) { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest("/applications", "POST", {
                ...formData,
                month: currentFilters.month,
                year: currentFilters.year
            });
            onClose();
            onRefresh();
        } catch (err) {
            showToast(err.message || 'Gagal menyimpan pengajuan', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrasi Pengajuan Baru">
            <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
                
                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Nama Peralatan</label>
                    <select 
                        className="form-control" 
                        required 
                        value={formData.equipment_id} 
                        onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                    >
                        <option value="">-- Pilih Peralatan --</option>
                        {masterData.equipments.map(e => (
                            <option key={e.id} value={e.id}>{e.equipment_name} ({e.brand?.brand_name})</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Nama Pemohon (Partner)</label>
                    <select 
                        className="form-control" 
                        required 
                        value={formData.partner_id} 
                        onChange={(e) => setFormData({...formData, partner_id: e.target.value})}
                    >
                        <option value="">-- Pilih Partner --</option>
                        {masterData.partners.map(p => (
                            <option key={p.id} value={p.id}>{p.name} {p.type ? `[${p.type.name}]` : ""}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Jumlah Unit</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        min="1" 
                        max="10" 
                        value={formData.count} 
                        onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})} 
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: "0.75rem 2rem" }} onClick={onClose}>
                        Batal
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
                        Daftarkan Sekarang
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RegistrationModal;
