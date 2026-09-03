import api from './axios';

export const getUsers = () => api.get('/auth/users/');
export const getRoles = () => api.get('/auth/roles/');
export const changeUserRole = (id, data) => api.patch(`/auth/users/${id}/role/`, data);
