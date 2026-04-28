const API_URL = '/api';

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  } else {
    const text = await res.text();
    if (!res.ok) throw { error: text || res.statusText };
    return text;
  }
}

export const api = {
  async get(path: string, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return handleResponse(res);
  },

  async post(path: string, data: any, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async put(path: string, data: any, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async delete(path: string, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return handleResponse(res);
  },
};
