import api from './axios';

// Produits d'approvisionnement (non cultivés par l'exploitation)
export const getProduitsApprovisionnement = () => api.get('/produits-approvisionnement/');
export const createProduitApprovisionnement = (data) => api.post('/produits-approvisionnement/', data);
export const deleteProduitApprovisionnement = (id) => api.delete(`/produits-approvisionnement/${id}/`);

// Approvisionnements (lots achetés)
export const getApprovisionnements = (params = {}) => api.get('/approvisionnements/', { params });
export const getApprovisionnement = (id) => api.get(`/approvisionnements/${id}/`);
export const createApprovisionnement = (data) => api.post('/approvisionnements/', data);
export const updateApprovisionnement = (id, data) => api.patch(`/approvisionnements/${id}/`, data);
export const deleteApprovisionnement = (id) => api.delete(`/approvisionnements/${id}/`);
export const getApprovisionnementsResume = (params = {}) => api.get('/approvisionnements/resume/', { params });

// Reventes (dépôt d'un lot chez une bayam-sellam)
export const getReventes = (params = {}) => api.get('/reventes/', { params });
export const createRevente = (data) => api.post('/reventes/', data);
export const updateRevente = (id, data) => api.patch(`/reventes/${id}/`, data);
export const deleteRevente = (id) => api.delete(`/reventes/${id}/`);
