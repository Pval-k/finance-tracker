// CommonJS file to initialize Firebase Admin
// This file uses require() which Next.js won't try to bundle
const { readFileSync } = require("fs");
const { join } = require("path");

let adminApp;
let adminAuth;
let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized && adminAuth) {
    return adminAuth;
  }

  try {
    // Use require() - Next.js won't analyze this file during build
    const { initializeApp, getApps, cert } = require("firebase-admin/app");
    const { getAuth } = require("firebase-admin/auth");

    // Check if Firebase Admin is already initialized
    if (getApps().length === 0) {
      let serviceAccount = null;

      // Try to load from environment variable first (for production/deployment)
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountKey) {
        try {
          serviceAccount = JSON.parse(serviceAccountKey);
        } catch (parseError) {
          console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", parseError);
        }
      }

      // If not found in env var, try to load from local file (for development)
      if (!serviceAccount) {
        try {
          const serviceAccountPath = join(process.cwd(), "service-account-key.json");
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
        adminApp = initializeApp();
      }
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    initialized = true;
    return adminAuth;
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

module.exports = { initializeFirebaseAdmin };

