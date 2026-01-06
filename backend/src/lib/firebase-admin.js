// ESM wrapper that uses CommonJS initialization file
// This prevents Next.js from trying to analyze firebase-admin imports during build
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { initializeFirebaseAdmin } = require("./firebase-admin-init.cjs");

let adminAuth = null;

// Export a getter that ensures initialization
export const getAdminAuth = async () => {
  if (!adminAuth) {
    adminAuth = initializeFirebaseAdmin();
  }
  return adminAuth;
};
