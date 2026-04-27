const API_BASE = '/api';

export const api = {
  async get(endpoint: string, headers = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    return res.json();
  },
  
  async post(endpoint: string, data: any, headers = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const companyService = {
  getAll: () => api.get('/admin/companies'),
  create: (data: any) => api.post('/admin/companies', data),
  getStats: (companyId: string) => api.get(`/tenant/${companyId}/stats`),
  getAccounts: (companyId: string) => api.get(`/tenant/${companyId}/accounts`),
  getProducts: (companyId: string) => api.get(`/tenant/${companyId}/products`),
  getAuditLogs: (companyId: string) => api.get(`/tenant/${companyId}/audit`)
};
