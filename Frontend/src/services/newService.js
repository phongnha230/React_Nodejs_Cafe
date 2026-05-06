import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const newsService = {
  getAll: (params) => api.get(API_ENDPOINTS.NEWS.LIST, {params}),
  getById: (id) => api.get(API_ENDPOINTS.NEWS.DETAIL(id)),
  create: (data) => api.post(API_ENDPOINTS.NEWS.CREATE, data),
  update: (id, data) => api.put(API_ENDPOINTS.NEWS.UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.NEWS.DELETE(id)),
};

export default newsService;
