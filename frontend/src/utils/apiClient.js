// utils/apiClient.js
export const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('passToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  return response;
};
