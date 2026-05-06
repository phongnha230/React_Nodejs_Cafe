import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const paymentService = {
  create: (data) => api.post(API_ENDPOINTS.PAYMENTS.CREATE, data),
  getAll: (params) => api.get(API_ENDPOINTS.PAYMENTS.LIST, { params }),
  getById: (id) => api.get(API_ENDPOINTS.PAYMENTS.DETAIL(id)),
  update: (id, data) => api.put(API_ENDPOINTS.PAYMENTS.UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.PAYMENTS.DELETE(id)),
};

export default paymentService;
