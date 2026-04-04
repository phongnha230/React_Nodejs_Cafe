import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const paymentServices = {
  //lấy danh sách thanh toán
  getAll: (params) => api.get(API_ENDPOINTS.PAYMENTS.LIST, { params }),

  //lấy chi tiết một thanh toán theo ID
  getById: (id) => api.get(API_ENDPOINTS.PAYMENTS.DETAIL(id)),

  //tạo mới một thanh toán
  create: (data) => api.post(API_ENDPOINTS.PAYMENTS.CREATE, data),

  //cập nhật thông tin thanh toán theo ID
  update: (id, data) => api.put(API_ENDPOINTS.PAYMENTS.UPDATE(id), data),

  //xóa một thanh toán theo ID
  delete: (id) => api.delete(API_ENDPOINTS.PAYMENTS.DELETE(id)),
};

export default paymentServices;