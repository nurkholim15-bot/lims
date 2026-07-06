import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@models/api";

export const useAppController = () => {
  const [user, setUser] = useState(null);
  const [appConfig, setAppConfig] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Authentication Logic
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthChecking(false);
      return;
    }

    try {
      const userData = await apiRequest("/me");
      if (userData) {
        setUser(userData);
        fetchMenus();
      }
    } catch (err) {
      console.warn("Auth check failed, but session preserved:", err.message);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const fetchConfig = async () => {
    const data = await apiRequest("/config");
    if (data) setAppConfig(data);
  };

  const fetchMenus = async () => {
    const data = await apiRequest("/menus");
    if (data) setMenuItems(data);
  };


  const fetchApplications = async (arg1 = {}, arg2 = "", arg3 = {}) => {
    setLoading(true);
    
    // Handle both formats: (filters) and (page, query, filters)
    let filters = {};
    let pageNum = 1;
    
    if (typeof arg1 === 'object' && !Array.isArray(arg1)) {
      filters = arg1;
      pageNum = filters.page || 1;
    } else {
      pageNum = arg1 || 1;
      filters = { ...arg3, query: arg2 || arg3.query || "" };
    }

    let url = "/applications";
    const queryParams = new URLSearchParams();
    
    // Pagination
    queryParams.append("page", pageNum);
    if (filters.limit) queryParams.append("limit", filters.limit);

    // Filters Mapping (frontend -> backend)
    if (filters.status && filters.status !== "All") queryParams.append("status", filters.status);
    
    // Map 'query' from frontend to 'reg_number' for backend
    const searchTerm = filters.query || filters.reg_number;
    if (searchTerm) queryParams.append("reg_number", searchTerm);
    
    if (filters.partner_code) queryParams.append("partner_code", filters.partner_code);
    
    // Date Filtering & Partition Routing
    if (filters.start_date) queryParams.append("start_date", filters.start_date);
    if (filters.end_date) queryParams.append("end_date", filters.end_date);
    
    // Legacy support for month/year if needed by backend elsewhere
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);
    
    if (queryParams.toString()) url += `?${queryParams.toString()}`;

    try {
      const resp = await apiRequest(url);
      // Backend returns { data: [], total: X, source_table: Y } for paginated requests
      if (resp && resp.data) {
        setApps(resp.data);
        setLoading(false);
        return resp; // Return full response to caller
      } else {
        const appsData = Array.isArray(resp) ? resp : (resp ? [resp] : []);
        setApps(appsData);
        setLoading(false);
        return { data: appsData };
      }
    } catch (err) {
      console.error("Fetch apps failed:", err);
      setLoading(false);
      return { data: [], error: err };
    }
  };

  const login = async (username, password) => {
    const data = await apiRequest("/login", "POST", { username, password });
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      await fetchMenus();
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMenuItems([]);
  };

  useEffect(() => {
    fetchConfig();
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    appConfig,
    menuItems,
    fetchApplications,
    isAuthChecking,
    login,
    logout
  };
};
