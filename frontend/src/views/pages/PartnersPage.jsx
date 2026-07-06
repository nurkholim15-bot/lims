import React, { useState } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";
import AuditHistoryModal from "@components/AuditHistoryModal";

const PartnersPage = ({ route, refreshTrigger, checkPasswordRequirement }) => {
  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedPartnerCode, setSelectedPartnerCode] = useState(null);

  const handleRowClick = (item) => {
    setSelectedPartnerId(item.id);
    setSelectedPartnerCode(item.code);
    setIsHistModalOpen(true);
  };

  const handleShowAllHistory = () => {
    setSelectedPartnerId(null);
    setSelectedPartnerCode(null);
    setIsHistModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nama Rekanan" },
    { key: "type_code", header: "Tipe" },
    { key: "alamat", header: "Alamat" },
    { key: "city_code", header: "Kota", render: (item) => item.city?.city_name || item.city_code || "-" },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <MasterDataPage 
        title={route?.title || "Daftar Rekanan"} 
        endpoint={route?.endpoint || "/partners"} 
        crudEndpoint={route?.crudEndpoint || "/management/partners"} 
        columns={route?.cols || columns} 
        refreshTrigger={refreshTrigger}
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Nama atau ID..."
        forceFilter={true}
        checkPasswordRequirement={checkPasswordRequirement}
      />

      {/* History Modal */}
      <AuditHistoryModal
        isOpen={isHistModalOpen}
        onClose={() => setIsHistModalOpen(false)}
        title={`Riwayat Perubahan Rekanan ${selectedPartnerCode ? `(Kode: ${selectedPartnerCode})` : "Keseluruhan"}`}
        endpoint="/hist-partners"
        idField="partner_id"
        idValue={selectedPartnerId}
        columns={[
          { key: "id", header: "ID Hist" },
          { key: "partner_id", header: "Partner ID" },
          { key: "name", header: "Nama" },
          { key: "type_code", header: "Tipe" },
          { key: "alamat", header: "Alamat" },
          { key: "city_code", header: "Kota" },
        ]}
      />
    </div>
  );
};

export default PartnersPage;
