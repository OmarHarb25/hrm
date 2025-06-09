import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

const headers = {
  headers: {
    'X-Role': 'admin', 
  }
};

export const submitIndividual = (data) => api.post('/individuals/', data, headers);
export const updateRisk = (id, data) => api.patch(`/individuals/${id}/risk`, data, headers);

export const fetchCases = () => api.get('/cases/');
export const submitCase = (data) => api.post('/cases/', data);
export const fetchReports = () => api.get('/reports/');
export const submitReport = (data) => api.post('/reports/', data);
