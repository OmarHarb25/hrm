import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

const headers = {
  headers: {
    'X-Role': 'admin',
  },
};


export const submitIndividual = (data) => api.post('/individuals/', data, headers);
export const updateRisk = (id, data) => api.patch(`/individuals/${id}/risk`, data, headers);


export const fetchCases = () => api.get('/cases/');
export const submitCase = (data) => api.post('/cases', data, headers);
export const deleteCaseById = (id) => api.delete(`/cases/${id}`, headers);
export const updateCaseById = (id, data) => api.put(`/cases/${id}`, data, headers);


export const fetchReports = () => api.get('/reports/');
export const submitReport = (data) => api.post('/reports/', data, headers);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data, headers);


export const uploadFile = (formData) =>
  api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Role': 'admin',
    },
  });

export const fetchSummaryStats = () => api.get('/analytics/summary', headers);

