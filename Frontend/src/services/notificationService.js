import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const notificationService = {
  getAll: (params) => api.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {params}),
  getById: (id) => api.get(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)),
  create: (data) => api.post(API_ENDPOINTS.NOTIFICATIONS.CREATE, data),
  update: (id, data) => api.put(API_ENDPOINTS.NOTIFICATIONS.UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),
}
export default notificationService;
