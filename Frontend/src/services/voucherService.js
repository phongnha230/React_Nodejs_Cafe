import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const voucherService = {
  getAll: () => api.get(API_ENDPOINTS.VOUCHERS.LIST),
  getWallet: () => api.get(API_ENDPOINTS.VOUCHERS.WALLET),
  redeem: (id) => api.post(API_ENDPOINTS.VOUCHERS.REDEEM(id)),
  getAdminAll: () => api.get(API_ENDPOINTS.VOUCHERS.ADMIN_LIST),
  create: (data) => api.post(API_ENDPOINTS.VOUCHERS.ADMIN_CREATE, data),
  update: (id, data) => api.put(API_ENDPOINTS.VOUCHERS.ADMIN_UPDATE(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.VOUCHERS.ADMIN_DELETE(id)),
};

export default voucherService;
