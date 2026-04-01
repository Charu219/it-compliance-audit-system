import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Users
export const getUsers = (params) => API.get('/users', { params });
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Audits
export const getAudits = () => API.get('/audits');
export const getAudit = (id) => API.get(`/audits/${id}`);
export const createAudit = (data) => API.post('/audits', data);
export const updateAudit = (id, data) => API.put(`/audits/${id}`, data);
export const deleteAudit = (id) => API.delete(`/audits/${id}`);

// Checklists
export const getChecklists = (params) => API.get('/checklists', { params });
export const createChecklist = (data) => API.post('/checklists', data);
export const bulkCreateChecklist = (data) => API.post('/checklists/bulk', data);
export const updateChecklist = (id, data) => API.put(`/checklists/${id}`, data);
export const deleteChecklist = (id) => API.delete(`/checklists/${id}`);

// Assignments
export const getAssignments = (params) => API.get('/assignments', { params });
export const createAssignment = (data) => API.post('/assignments', data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Evidence
export const getEvidence = (params) => API.get('/evidence', { params });
export const uploadEvidence = (formData) => API.post('/evidence', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteEvidence = (id) => API.delete(`/evidence/${id}`);

// Results
export const getResults = (params) => API.get('/results', { params });
export const saveResult = (data) => API.post('/results', data);
export const getResultByChecklist = (checklistId) => API.get(`/results/checklist/${checklistId}`);

// Dashboard
export const getAdminDashboard = () => API.get('/dashboard/admin');
export const getAuditorDashboard = () => API.get('/dashboard/auditor');
export const getDepartmentDashboard = () => API.get('/dashboard/department');

export default API;
