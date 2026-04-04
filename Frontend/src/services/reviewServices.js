import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const reviewServices = {
  // Get all reviews with optional query parameters
  getAll: (params) => api.get(API_ENDPOINTS.REVIEWS.LIST, { params }),
 // Get a review by ID
  getById: (id) => api.get(API_ENDPOINTS.REVIEWS.DETAIL(id)),
  // Create a new review
  create: (data) => api.post(API_ENDPOINTS.REVIEWS.CREATE, data),
  // Update a review by ID
  update: (id, data) => api.put(API_ENDPOINTS.REVIEWS.UPDATE(id), data),
  // Delete a review by ID by admin
  delete: (id) => api.delete(API_ENDPOINTS.REVIEWS.DELETE(id)),
}
export default reviewServices