import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const menuServices = {

  // Lấy danh sách menu

  getAll: (params) => api.get(API_ENDPOINTS.MENU.LIST, {params}),

  // Lấy chi tiết menu theo ID
  getById: (id) => api.get(API_ENDPOINTS.MENU.DETAIL(id)),

  // Tạo mới menu
  create: (data) => api.post(API_ENDPOINTS.MENU.CREATE, data),

  // Cập nhật menu theo ID
  update: (id, data) => api.put(API_ENDPOINTS.MENU.UPDATE(id), data),

  // Xóa menu theo ID
  delete: (id) => api.delete(API_ENDPOINTS.MENU.DELETE(id)),
}
export default menuServices;