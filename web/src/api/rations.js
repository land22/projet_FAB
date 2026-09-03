import api from './axios';

export const getRations = (month, year) => api.get('/rations/', { params: { month, year } });
export const createRation = (data) => api.post('/rations/', data);
export const updateRation = (id, data) => api.patch(`/rations/${id}/`, data);
export const deleteRation = (id) => api.delete(`/rations/${id}/`);
export const getRationTotal = (month, year) => api.get('/rations/total/', { params: { month, year } });
