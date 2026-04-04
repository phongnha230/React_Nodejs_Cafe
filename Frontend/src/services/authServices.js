import api from "../utils/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
const authServices = {
  login : (data) => api.post(API_ENDPOINTS.USERS.LOGIN, data),
  register : (data) => api.post(API_ENDPOINTS.USERS.REGISTER, data),
  logout: ()=> api.post(API_ENDPOINTS.AUTH.LOGOUT),
  refreshToken: (refreshToken) => api.post (API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }),
  forgotPassword: (email) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (token, data) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, ...data }), 
}
export default authServices;
