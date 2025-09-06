export const API_CONFIG = {
  BASE_URL: 'https://aviation-certs-api.onrender.com',
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};