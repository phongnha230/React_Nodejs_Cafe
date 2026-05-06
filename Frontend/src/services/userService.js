import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const userService = {
  login: (data) => api.post(API_ENDPOINTS.USERS.LOGIN, data),
  register: (data) => api.post(API_ENDPOINTS.USERS.REGISTER, data),
  getProfile: () => api.get(API_ENDPOINTS.USERS.PROFILE),

  // Admin user management
  getAll: (params) => api.get(API_ENDPOINTS.USERS.LIST, { params }),
  getById: (id) => api.get(API_ENDPOINTS.USERS.DETAIL(id)),
  update: (id, data) => api.put(API_ENDPOINTS.USERS.UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.USERS.DELETE(id)), 
}
export default userService;
