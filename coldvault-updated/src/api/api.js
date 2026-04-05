import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  }
});
export const addChamber = (data) => {
  return axios.post("http://localhost:8080/api/chambers", data);
};


// ─── Chambers ────────────────────────────
export const getAllChambers = (adminId) => api.get(`/chambers?adminId=${adminId}`);
export const createChamber = (data) => api.post('/chambers', data);
export const updateChamber  = (id, data) => api.put(`/chambers/${id}`, data);
export const deleteChamber  = (id) => api.delete(`/chambers/${id}`);

// ─── Customers ───────────────────────────

export const getAllCustomers = () => api.get('/customers');
export const getCustomersByAdmin = (adminId) => api.get(`/customers?adminId=${adminId}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// ─── Bookings ────────────────────────────
export const getAllBookings  = () => api.get('/bookings');
export const createBooking = (data) => api.post('/bookings', data);
export const completeBooking = (id) => api.put(`/bookings/${id}/complete`);
export const deleteBooking  = (id) => api.delete(`/bookings/${id}`);

// ─── Auth ────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);


export default api;