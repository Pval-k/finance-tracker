// API Configuration
// In development: uses proxy from package.json (localhost:3000)
// In production: uses REACT_APP_API_URL if set, otherwise assumes same domain
const getApiUrl = () => {
  // If REACT_APP_API_URL is set (should include full URL like https://backend.vercel.app)
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}/api/transactions`;
  }

  // Development: proxy handles /api requests -> localhost:3000
  // Production: relative path (same domain)
  return "/api/transactions";
};

export const API_URL = getApiUrl();
