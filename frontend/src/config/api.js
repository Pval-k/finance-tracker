// API Configuration
// Firebase Cloud Functions: https://REGION-PROJECT_ID.cloudfunctions.net/api
// Development: uses proxy from package.json (localhost:3000) or local emulator
// Production: uses REACT_APP_API_URL if set (Cloud Functions URL), otherwise same domain

const getApiBaseUrl = () => {
  // Production: Use Cloud Functions URL if provided
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Development: Check if using Firebase emulator
  if (process.env.REACT_APP_USE_EMULATOR === "true") {
    return "http://localhost:5001";
  }

  // Development: relative path (for Firebase emulator)
  // For Firebase Functions deployment, this will be the Cloud Functions URL
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

// Get full API URL for transactions endpoint
const getApiUrl = () => {
  const baseUrl = API_BASE_URL;
  if (baseUrl) {
    // Firebase Cloud Functions or custom backend URL
    return `${baseUrl}/api/transactions`;
  }
  // Development: relative path (proxy handles it)
  return "/api/transactions";
};

export const API_URL = getApiUrl();

// Helper to get API URL for any endpoint
export const getApiEndpoint = (endpoint) => {
  const baseUrl = API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/api/${endpoint}`;
  }
  return `/api/${endpoint}`;
};
