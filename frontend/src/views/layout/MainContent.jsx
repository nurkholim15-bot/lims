import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "@pages/Dashboard";
import DatabaseMaintenance from "@pages/DatabaseMaintenance";
// import AssetManagementPage from "@pages/AssetManagementPage";
const AssetManagementPage = React.lazy(() => import("@pages/AssetManagementPage"));
import ToolAvailabilityPage from "@pages/ToolAvailabilityPage";
import Submission from "@pages/Submission";
import Planning from "@pages/Planning";
import WorkflowPage from "@pages/WorkflowPage";
import GlobalSearchPage from "@pages/GlobalSearchPage";
import MasterDataPage from "@pages/MasterDataPage";
import TesterMastersPage from "@pages/TesterMastersPage";
import ScoringAspectsPage from "@pages/ScoringAspectsPage";
import ScoringSubAspectsPage from "@pages/ScoringSubAspectsPage";
import ItemSubAspectItemsPage from "@pages/ItemSubAspectItemsPage";
import MethodologiesPage from "@pages/MethodologiesPage";
import ModelsPage from "@pages/ModelsPage";
import VariantsPage from "@pages/VariantsPage";
import RolesPage from "@pages/RolesPage";
import RoleMenusHistPage from "@pages/RoleMenusHistPage";
import ReportsSummaryPage from "@pages/ReportsSummaryPage";
import ReportsDetailPage from "@pages/ReportsDetailPage";
import FinanceReportPage from "@pages/FinanceReportPage";
import UserSessionsPage from "@pages/UserSessionsPage";
import TravelPage from "@pages/TravelPage";
import ReimbursementPage from "@pages/ReimbursementPage";
import CashAdvancePage from "@pages/CashAdvancePage";
import WelcomePage from "@pages/WelcomePage";
import PaymentPage from "@pages/PaymentPage";
import ScoringLevelsPage from "@pages/ScoringLevelsPage";
import TestingToolsPage from "@pages/TestingToolsPage";
import GlobalParametersPage from "@pages/GlobalParametersPage";
import UsersPage from "@pages/UsersPage";
import MenusPage from "@pages/MenusPage";
import AssetListReport from "@pages/AssetListReport";
import AssetHandoverReport from "@pages/AssetHandoverReport";
import MasterAssetStatusesPage from "@pages/MasterAssetStatusesPage";
import TestStandardsPage from "@pages/TestStandardsPage";
import TestTypesPage from "@pages/TestTypesPage";
import StatusApplicationsPage from "@pages/StatusApplicationsPage";
import BrandsPage from "@pages/BrandsPage";
import CitiesPage from "@pages/CitiesPage";
import LocationsPage from "@pages/LocationsPage";
import PartnerTypesPage from "@pages/PartnerTypesPage";
import OriginsPage from "@pages/OriginsPage";
import ProvincesPage from "@pages/ProvincesPage";
import PartnersPage from "@pages/PartnersPage";
import MaterialCategoriesPage from "@pages/MaterialCategoriesPage";
import AsistenLab from "@pages/AsistenLab";
import Pagination from "@components/Pagination";
import { workflowRoutes, getMasterRoutes } from "@constants/routes";

const MainContent = ({
  activePath,
  setActivePath,
  user,
  appConfig,
  loading,
  applications,
  setApplications,
  applicationsPage,
  applicationsTotal,
  applicationsLimit,
  handlePageChange,
  refreshData,
  searchFilters,
  handleApplyFilters,
  handleEditMaster,
  setEditingItem,
  setEditingEndpoint,
  setEditingCrudEndpoint,
  setModalType,
  setSelectedApp,
  refreshMaster,
  refreshTesterMasters,
  refreshUserSessions,
  checkPasswordRequirement,
  menus
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Memuat data...</div>;

  const masterRoutes = getMasterRoutes(setActivePath);

  const renderWorkflowPage = (path, route) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <WorkflowPage
        stage={path.substring(1)}
        title={route.title}
        targetStatus={route.status === "ALL" ? "" : route.status}
        actionLabel={route.label}
        apps={applications}
        setApps={setApplications}
        currentUser={user}
        fetchApplications={refreshData}
        onAction={(app) => {
          setSelectedApp(app);
          setModalType(path.substring(1));
        }}
        appConfig={appConfig}
        checkPasswordRequirement={checkPasswordRequirement}
      />
      <Pagination current={applicationsPage} total={applicationsTotal} limit={applicationsLimit} onPageChange={handlePageChange} />
    </div>
  );

  const renderMasterPage = (path, route) => {
    const onEdit = (item) => handleEditMaster(item, route);
    switch (path) {
      case "/roles": return <RolesPage onChangeRole={() => refreshData()} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/user-sessions": return <UserSessionsPage refreshTrigger={refreshUserSessions} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/tester-masters": 
        return <TesterMastersPage onEdit={(item) => handleEditMaster(item, { endpoint: "/tester-masters", crudEndpoint: "/management/tester-masters" })} refreshTrigger={refreshTesterMasters} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/scoring-aspects": 
        return <ScoringAspectsPage onEdit={onEdit} onAdd={() => { setEditingItem(null); setEditingEndpoint(route.endpoint); setEditingCrudEndpoint(route.crudEndpoint); setModalType("edit-master"); }} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/scoring-sub-aspects":
        return <ScoringSubAspectsPage onEdit={onEdit} onAdd={() => { setEditingItem(null); setEditingEndpoint(route.endpoint); setEditingCrudEndpoint(route.crudEndpoint); setModalType("edit-master"); }} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/scoring-sub-aspect-items":
        return <ItemSubAspectItemsPage onEdit={onEdit} onAdd={() => { setEditingItem(null); setEditingEndpoint(route.endpoint); setEditingCrudEndpoint(route.crudEndpoint); setModalType("edit-master"); }} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/methodologies":
        return <MethodologiesPage onEdit={onEdit} onAdd={() => { setEditingItem(null); setEditingEndpoint(route.endpoint); setEditingCrudEndpoint(route.crudEndpoint); setModalType("edit-master"); }} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/models":
        return <ModelsPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/variants":
        return <VariantsPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/brands":
        return <BrandsPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/cities":
        return <CitiesPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/locations":
        return <LocationsPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/scoring-levels":
        return <ScoringLevelsPage onEdit={onEdit} onAdd={() => { setEditingItem(null); setEditingEndpoint(route.endpoint); setEditingCrudEndpoint(route.crudEndpoint); setModalType("edit-master"); }} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/testing-tools":
        return <TestingToolsPage title={route.title} refreshTrigger={refreshMaster} setSelectedApp={setSelectedApp} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/global-params":
        return <GlobalParametersPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/asset-status-mgmt":
        return <MasterAssetStatusesPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/standards":
        return <TestStandardsPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/test-types":
        return <TestTypesPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/status-app-mgmt":
        return <StatusApplicationsPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/users":
        return <UsersPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/menus":
        return <MenusPage route={route} onEdit={onEdit} refreshTrigger={refreshMaster} setEditingItem={setEditingItem} setEditingEndpoint={setEditingEndpoint} setEditingCrudEndpoint={setEditingCrudEndpoint} setModalType={setModalType} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/partner-types":
        return <PartnerTypesPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/mat-cats":
        return <MaterialCategoriesPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/origins":
        return <OriginsPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/partners":
        return <PartnersPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/provinces":
        return <ProvincesPage route={route} refreshTrigger={refreshMaster} checkPasswordRequirement={checkPasswordRequirement} />;
      case "/role-menus-hist":
        return <RoleMenusHistPage />;
      default:
        return (
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
            onEdit={onEdit}
            refreshTrigger={refreshMaster}
            filterConfig={route.filterConfig}
            forceFilter={route.forceFilter}
            hideActions={route.hideActions}
          />
        );
    }
  };

  return (
    <Routes>
      {/* 1. Workflow Routes */}
      {Object.entries(workflowRoutes).map(([path, route]) => (
        path !== "/submission" && (
          <Route key={path} path={path} element={renderWorkflowPage(path, route)} />
        )
      ))}

      {/* 2. Travel / Reimbursement */}
      <Route path="/travel" element={<TravelPage user={user} checkPasswordRequirement={checkPasswordRequirement} />} />
      <Route path="/reimbursement" element={<ReimbursementPage user={user} checkPasswordRequirement={checkPasswordRequirement} />} />
      <Route path="/cash-advance" element={<CashAdvancePage user={user} checkPasswordRequirement={checkPasswordRequirement} />} />
      <Route path="/assets" element={<AssetManagementPage user={user} checkPasswordRequirement={checkPasswordRequirement} />} />

      {/* 3. Reports */}
      <Route path="/reports-summary" element={<ReportsSummaryPage />} />
      <Route path="/reports-detail" element={<ReportsDetailPage />} />
      <Route path="/reports/asset-list" element={<AssetListReport />} />
      <Route path="/reports/asset-handover" element={<AssetHandoverReport />} />
      <Route path="/reports-finance" element={<FinanceReportPage user={user} />} />
      <Route path="/reports-finance/spd" element={<FinanceReportPage user={user} reportType="spd" />} />
      <Route path="/reports-finance/cash-advance" element={<FinanceReportPage user={user} reportType="cash_advance" />} />
      <Route path="/reports-finance/reimbursement" element={<FinanceReportPage user={user} reportType="reimbursement" />} />

      {/* 4. Master Routes */}
      {Object.entries(masterRoutes).map(([path, route]) => (
        <Route key={path} path={path} element={renderMasterPage(path, route)} />
      ))}

      {/* 5. Other Standard Routes */}
      <Route path="/welcome" element={
        <WelcomePage 
          user={user} 
          appConfig={appConfig} 
          menus={menus}
          onOpenApp={(app, stage) => {
            setSelectedApp(app);
            setModalType(stage);
          }} 
        />
      } />
      <Route path="/db-management" element={<DatabaseMaintenance user={user} />} />
      <Route path="/asisten-lab" element={<AsistenLab user={user} appConfig={appConfig} />} />
      <Route path="/dashboard" element={<Dashboard apps={applications} onRefresh={() => refreshData(1, "ALL")} />} />
      <Route path="/asset-tracking" element={
        <React.Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Memuat halaman...</div>}>
          <AssetManagementPage currentUser={user} appConfig={appConfig} />
        </React.Suspense>
      } />
      <Route path="/tool-availability" element={<ToolAvailabilityPage setSelectedApp={setSelectedApp} setModalType={setModalType} />} />
      
      <Route path="/submission" element={
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="filter-bar" style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", marginBottom: "0.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
             <div style={{ width: "200px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>Pilih Bulan</label>
                <select value={searchFilters.month} onChange={(e) => handleApplyFilters({ ...searchFilters, month: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: "150px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>Pilih Tahun</label>
                <select value={searchFilters.year} onChange={(e) => handleApplyFilters({ ...searchFilters, year: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={y} value={y}>{y}</option>
                    );
                  })}
                </select>
              </div>
          </div>
          <Submission
            currentUser={user}
            onOpenModal={(app) => {
              setSelectedApp(app);
              setModalType("submission");
            }}
            applications={applications}
            appConfig={appConfig}
            filters={searchFilters}
          />
          <Pagination current={applicationsPage} total={applicationsTotal} limit={applicationsLimit} onPageChange={handlePageChange} />
        </div>
      } />

      <Route path="/payments" element={<PaymentPage currentUser={user} appConfig={appConfig} />} />
      <Route path="/global-search" element={
        <GlobalSearchPage appConfig={appConfig} user={user} onAction={(app) => {
          setSelectedApp(app);
          setModalType("query");
        }} />
      } />

      {/* Default Fallback */}
      <Route path="/index.html" element={<Navigate to="/welcome" replace />} />
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="*" element={
        <WelcomePage 
          user={user} 
          appConfig={appConfig} 
          menus={menus}
          onOpenApp={(app, stage) => {
            setSelectedApp(app);
            setModalType(stage);
          }} 
        />
      } />
    </Routes>
  );
};

export default MainContent;
