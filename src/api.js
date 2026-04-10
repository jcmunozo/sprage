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
  if (!res.ok) throw new Error(data.message || 'Request failed');
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
  },
  progress: {
    getDue: () => request('/progress/due'),
    recordReview: (cardId, quality) =>
      request('/progress/review', { method: 'POST', body: JSON.stringify({ cardId, quality }) }),
  },
};
