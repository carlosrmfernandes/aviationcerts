export const API_CONFIG = {
  BASE_URL: 'https://aviation-certs-api.onrender.com',
  //BASE_URL: 'http://127.0.0.1:8000'
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};