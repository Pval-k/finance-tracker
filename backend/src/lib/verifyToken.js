// NO STATIC IMPORTS - Initialize firebase-admin inline to avoid build analysis
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

      // Use dynamic import with string manipulation to prevent static analysis
      const mod = "mo" + "d" + "ul" + "e";
      const { createRequire } = await import(mod);
      const requireFn = createRequire(import.meta.url);

      // Dynamically require firebase-admin using string concatenation
      const firebaseAdminApp = "firebase-admin" + "/app";
      const firebaseAdminAuth = "firebase-admin" + "/auth";
      const fsModule = "fs";
      const pathModule = "path";

      const { initializeApp, getApps, cert } = requireFn(firebaseAdminApp);
      const { getAuth } = requireFn(firebaseAdminAuth);
      const { readFileSync } = requireFn(fsModule);
      const { join } = requireFn(pathModule);

      console.log("[Firebase Admin] Modules loaded");

      // Initialize Firebase Admin
      if (getApps().length === 0) {
        let serviceAccount = null;

        // Try to load from environment variable first
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountKey) {
          try {
            serviceAccount = JSON.parse(serviceAccountKey);
          } catch (parseError) {
            console.error(
              "Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:",
              parseError
            );
          }
        }

        // If not found in env var, try to load from local file
        if (!serviceAccount) {
          try {
            const serviceAccountPath = join(
              process.cwd(),
              "service-account-key.json"
            );
            const serviceAccountFile = readFileSync(serviceAccountPath, "utf8");
            serviceAccount = JSON.parse(serviceAccountFile);
          } catch (fileError) {
            // File doesn't exist - that's okay
          }
        }

        if (serviceAccount) {
          initializeApp({
            credential: cert(serviceAccount),
          });
        } else {
          initializeApp();
        }
      }

      adminAuthCache = getAuth(getApps()[0]);
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
