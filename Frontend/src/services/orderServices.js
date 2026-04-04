import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const orderServices = { 
  //get all orders with optional query parameters
  getAll: (params) => api.get(API_ENDPOINTS.ORDERS.LIST, { params }),

  //get an order by ID by admin
  getById: (id) => api.get(API_ENDPOINTS.ORDERS.DETAIL(id)),

  //create a new order by admin
  create: (data) => api.post(API_ENDPOINTS.ORDERS.CREATE, data),

  //update order status by ID (admin only)
  updateStatus: (id, data) => api.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), data),
};

export default orderServices;