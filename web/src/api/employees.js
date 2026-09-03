import api from './axios';

export const getEmployees = () => api.get('/employees/');
export const getEmployee = (id) => api.get(`/employees/${id}/`);
export const createEmployee = (data) => api.post('/employees/', data);
export const updateEmployee = (id, data) => api.patch(`/employees/${id}/`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}/`);
// Avances
export const getAvances = (employeeId) => api.get(`/avances/?employee=${employeeId}`);
export const createAvance = (data) => api.post('/avances/', data);
export const deleteAvance = (id) => api.delete(`/avances/${id}/`);

// Maladies
export const getMaladies = (employeeId) => api.get(`/maladies/?employee=${employeeId}`);
export const createMaladie = (data) => api.post('/maladies/', data);
export const deleteMaladie = (id) => api.delete(`/maladies/${id}/`);

// Solde du mois
export const getSolde = (employeeId, month, year) =>
  api.get(`/employees/${employeeId}/solde/?month=${month}&year=${year}`);