import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const tableService = {
  getAll: (params) => api.get(API_ENDPOINTS.TABLES.LIST, { params }),
  getQrLinks: () => api.get(API_ENDPOINTS.TABLES.QR_LINKS),
  getById: (id) => api.get(API_ENDPOINTS.TABLES.DETAIL(id)),
  create: (data) => api.post(API_ENDPOINTS.TABLES.CREATE, data),
  update: (id, data) => api.put(API_ENDPOINTS.TABLES.UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.TABLES.DELETE(id)),
};

export default tableService;
