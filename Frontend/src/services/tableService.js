import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const tableService = {
  getAll: (params) => api.get(API_ENDPOINTS.TABLES.LIST, { params }),
  getById: (id) => api.get(API_ENDPOINTS.TABLES.DETAIL(id)),
};

export default tableService;
