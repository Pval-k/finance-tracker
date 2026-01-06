// NO STATIC IMPORTS - Load firebase-admin at runtime to avoid build analysis
let adminAuthCache = null;
let initPromise = null;

async function getAdminAuth() {
  if (adminAuthCache) {
    return adminAuthCache;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      console.log("[Firebase Admin] Starting initialization...");
      // Dynamically load the CommonJS file at runtime
      const mod = "mo" + "d" + "ul" + "e";
      console.log("[Firebase Admin] Loading module:", mod);
      const { createRequire } = await import(mod);
      console.log("[Firebase Admin] createRequire loaded");
      const requireFn = createRequire(import.meta.url);
      const path = "./firebase-admin-init" + ".cjs";
      console.log("[Firebase Admin] Loading CommonJS file:", path);
      const initModule = requireFn(path);
      console.log("[Firebase Admin] CommonJS file loaded");
      const fnName = "initialize" + "Firebase" + "Admin";
      console.log("[Firebase Admin] Calling initialization function");
      adminAuthCache = initModule[fnName]();
      console.log("[Firebase Admin] Initialization complete");
      return adminAuthCache;
    } catch (error) {
      console.error("[Firebase Admin] Error loading Firebase Admin:", error);
      console.error("[Firebase Admin] Error stack:", error.stack);
      throw error;
    }
  })();

  return initPromise;
}

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
