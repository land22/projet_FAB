import api from './axios';

// Clients (bayam-sellam)
export const getClients = () => api.get('/clients/');
export const getClient = (id) => api.get(`/clients/${id}/`);
export const createClient = (data) => api.post('/clients/', data);
export const updateClient = (id, data) => api.patch(`/clients/${id}/`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}/`);
export const getClientsResume = () => api.get('/clients/resume/');

// Spéculations
export const getSpeculations = () => api.get('/speculations/');
export const createSpeculation = (data) => api.post('/speculations/', data);
export const deleteSpeculation = (id) => api.delete(`/speculations/${id}/`);

// Livraisons (ventes)
export const getLivraisons = (params = {}) => api.get('/livraisons/', { params });
export const createLivraison = (data) => api.post('/livraisons/', data);
export const updateLivraison = (id, data) => api.patch(`/livraisons/${id}/`, data);
export const deleteLivraison = (id) => api.delete(`/livraisons/${id}/`);

// Versements (recouvrements)
export const getVersements = (params = {}) => api.get('/versements/', { params });
export const createVersement = (data) => api.post('/versements/', data);
export const deleteVersement = (id) => api.delete(`/versements/${id}/`);
