import { getAdminAuth } from "./firebase-admin";

/**
 * Verifies a Firebase ID token and returns the user ID
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{userId: string, error: null} | {userId: null, error: NextResponse}>}
 */
export async function verifyToken(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        userId: null,
        error: {
          status: 401,
          message: "Unauthorized: No token provided",
        },
      };
    }

    // Extract the token
    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return {
        userId: null,
        error: {
          status: 401,
          message: "Unauthorized: Invalid token format",
        },
      };
    }

    // Verify the token
    const adminAuth = await getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Return the user ID
    return {
      userId: decodedToken.uid,
      error: null,
    };
  } catch (error) {
    console.error("Error verifying token:", error);

    // Handle specific Firebase Auth errors
    if (error.code === "auth/id-token-expired") {
      return {
        userId: null,
        error: {
          status: 401,
          message: "Unauthorized: Token expired",
        },
      };
    }

    if (error.code === "auth/id-token-revoked") {
      return {
        userId: null,
        error: {
          status: 401,
          message: "Unauthorized: Token revoked",
        },
      };
    }

    return {
      userId: null,
      error: {
        status: 401,
        message: "Unauthorized: Invalid token",
      },
    };
  }
}
