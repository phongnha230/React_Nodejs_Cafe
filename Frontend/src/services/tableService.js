import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const tableService = {
  getAll: (params) => api.get(API_ENDPOINTS.TABLES.LIST, { params }),
  getQrLinks: () => api.get(API_ENDPOINTS.TABLES.QR_LINKS),
  getById: (id) => api.get(API_ENDPOINTS.TABLES.DETAIL(id)),
};

export default tableService;
