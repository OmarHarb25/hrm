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


export const fetchCases = () => api.get('/cases/', headers);
export const submitCase = (data) => api.post('/cases/', data, headers); 
export const deleteCaseById = (id) => api.delete(`/cases/${id}`, headers);
export const updateCaseById = (id, data) => api.put(`/cases/${id}`, data, headers); 


export const fetchReports = () => api.get('/reports/', headers);
export const submitReport = (data) => api.post('/reports/', data, headers);
export const updateReport = async (reportId, reportData) => {
  try {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

export const uploadFile = (formData) =>
  api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Role': 'admin',
    },
  });

export const fetchSummaryStats = () => api.get('/analytics/summary', headers);