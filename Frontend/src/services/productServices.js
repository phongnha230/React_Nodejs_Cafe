import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const productServices = {
  // Get all products with optional query parameters
  getAll: (params) => api.get(API_ENDPOINTS.PRODUCTS.LIST, { params }),
  // Get a product by ID
  getById: (id) => api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id)),
  // Create a new product
  create: (data) => api.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
  // Update a product by ID
  update: (id, data) => api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),
  // Delete a product by ID by admin
  delete: (id) => api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};
export default productServices;