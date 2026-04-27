const BASE_URL = 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password, username) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) }),
  },
  cards: {
    getAll: () => request('/cards'),
    create: (card) => request('/cards', { method: 'POST', body: JSON.stringify(card) }),
    update: (id, data) => request(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  progress: {
    getDue: () => request('/progress/due'),
    recordReview: (cardId, quality) =>
      request('/progress/review', { method: 'POST', body: JSON.stringify({ cardId, quality }) }),
  },
  languages: {
    getAll: () => request('/languages'),
    create: (data) => request('/languages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/languages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/languages/${id}`, { method: 'DELETE' }),
  },
  links: {
    getAll: () => request('/links'),
    getByLanguageId: (languageId) => request(`/links?languageId=${encodeURIComponent(languageId)}`),
    create: (link) => request('/links', { method: 'POST', body: JSON.stringify(link) }),
    update: (id, data) => request(`/links/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/links/${id}`, { method: 'DELETE' }),
  },
};
