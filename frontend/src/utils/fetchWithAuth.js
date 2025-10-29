// utils/fetchWithAuth.js
export const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 401 || response.status === 403) {
    window.location.href = "/login"; // force logout
    return;
  }

  return response;
};
