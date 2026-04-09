const API_URL = 'https://s26-group-17.onrender.com';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getMe: () => request('/auth/me'),
  getBoards: () => request('/boards'),
  createBoard: (data: { name: string; course_name?: string }) =>
    request('/boards', { method: 'POST', body: JSON.stringify(data) }),
  getCards: (boardId: string) => request(`/cards?board_id=${boardId}`),
  createCard: (data: object) =>
    request('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (cardId: string, data: object) =>
    request(`/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (cardId: string) =>
    request(`/cards/${cardId}`, { method: 'DELETE' }),
  getLeaderboard: () => request('/boards/leaderboard'),
  deleteBoard: (boardId: string) => request(`/boards/${boardId}`, { method: 'DELETE' }),
  moveCard: (cardId: string, data: { column: string; position: number }) =>
    request(`/cards/${cardId}/move`, { method: 'PATCH', body: JSON.stringify(data) }),
};
