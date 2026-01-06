import { readFileSync } from "fs";
import { join } from "path";

// Initialize Firebase Admin SDK
let adminApp;
let adminAuth;
let initPromise = null;

// Lazy initialization to avoid build-time resolution
async function initialize() {
  if (adminAuth) {
    return adminAuth;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Dynamic import to avoid build-time bundling
      const { initializeApp, getApps, cert } = await import(
        "firebase-admin/app"
      );
      const { getAuth } = await import("firebase-admin/auth");

      // Check if Firebase Admin is already initialized
      if (getApps().length === 0) {
        let serviceAccount = null;

        // Try to load from environment variable first (for production/deployment)
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

        // If not found in env var, try to load from local file (for development)
        if (!serviceAccount) {
          try {
            const serviceAccountPath = join(
              process.cwd(),
              "service-account-key.json"
            );
            const serviceAccountFile = readFileSync(serviceAccountPath, "utf8");
            serviceAccount = JSON.parse(serviceAccountFile);
          } catch (fileError) {
            // File doesn't exist or can't be read - that's okay, will try default credentials
          }
        }

        if (serviceAccount) {
          // Initialize with service account
          adminApp = initializeApp({
            credential: cert(serviceAccount),
          });
        } else {
          // Fallback: Initialize with application default credentials
          // This works on Firebase hosting or with GOOGLE_APPLICATION_CREDENTIALS env var
          adminApp = initializeApp();
        }
      } else {
        adminApp = getApps()[0];
      }

      adminAuth = getAuth(adminApp);
      return adminAuth;
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw error;
    }
  })();

  return initPromise;
}

// Initialize immediately but asynchronously
initialize().catch((error) => {
  console.error("Failed to initialize Firebase Admin:", error);
});

// Export a getter that ensures initialization
export const getAdminAuth = async () => {
  return await initialize();
};
