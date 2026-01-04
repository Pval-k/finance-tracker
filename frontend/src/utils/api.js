import { auth } from "../config/firebase";

/**
 * Makes an authenticated API request with Firebase ID token
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    // Get the current user
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the ID token
    const token = await user.getIdToken();

    // Set up headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error("Error in authenticated fetch:", error);
    throw error;
  }
}

