import React, { useState } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import MasterDataPage from "./MasterDataPage";
import AuditHistoryModal from "@components/AuditHistoryModal";

const UsersPage = ({ route, onEdit, refreshTrigger, setEditingItem, setEditingEndpoint, setEditingCrudEndpoint, setModalType }) => {
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);

  const handleRowClick = (item) => {
    setSelectedUserId(item.id);
    setSelectedUsername(item.username);
    setIsHistModalOpen(true);
  };

  const handleShowAllHistory = () => {
    setSelectedUserId(null);
    setSelectedUsername(null);
    setIsHistModalOpen(true);
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
        searchField={route.searchField}
        searchPlaceholder={route.searchPlaceholder}
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
      />

      <AuditHistoryModal
        isOpen={isHistModalOpen}
        onClose={() => setIsHistModalOpen(false)}
        title={`Riwayat Perubahan User ${selectedUsername ? `(${selectedUsername})` : "Keseluruhan"}`}
        endpoint="/hist-users"
        idField="user_id"
        idValue={selectedUserId}
        columns={[
          { key: "id", header: "ID" },
          { key: "user_id", header: "User ID" },
          { key: "username", header: "Username" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Telepon" },
          { key: "role_id", header: "Role ID" },
        ]}
      />
    </>
  );
};

export default UsersPage;
