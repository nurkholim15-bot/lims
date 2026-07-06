import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import MasterDataPage from "./MasterDataPage";
import AuditHistoryModal from "@components/AuditHistoryModal";

const MasterAssetStatusesPage = ({ route, onEdit, refreshTrigger, setEditingItem, setEditingEndpoint, setEditingCrudEndpoint, setModalType }) => {
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [selectedMasId, setSelectedMasId] = useState(null);

  const handleRowClick = (item) => {
    setSelectedMasId(item.id);
    setIsHistModalOpen(true);
  };

  const handleShowAllHistory = () => {
    setSelectedMasId(null);
    setIsHistModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <>
      <MasterDataPage
        title={route.title}
        endpoint={route.endpoint}
        crudEndpoint={route.crudEndpoint}
        columns={route.columns}
        onAdd={() => {
          setEditingItem(null);
          setEditingCrudEndpoint(route.crudEndpoint);
          setEditingEndpoint(route.endpoint);
          setModalType("edit-master");
        }}
        onEdit={(item) => onEdit(item, route)}
        refreshTrigger={refreshTrigger}
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Status Aset..."
      />

      <AuditHistoryModal
        isOpen={isHistModalOpen}
        onClose={() => setIsHistModalOpen(false)}
        title={`Riwayat Perubahan Status Aset ${selectedMasId ? `(ID: ${selectedMasId})` : "Keseluruhan"}`}
        endpoint="/hist-asset-statuses"
        idField="mas_id"
        idValue={selectedMasId}
        columns={[
          { key: "id", header: "ID" },
          { key: "mas_id", header: "Ref ID" },
          { key: "asset_status_code", header: "Kode" },
          { key: "asset_status_name", header: "Nama Status" },
        ]}
      />
    </>
  );
};

export default MasterAssetStatusesPage;
