// ESM wrapper - NO STATIC IMPORTS to prevent Next.js build analysis
// All imports happen at runtime via dynamic require
let adminAuth = null;
let initPromise = null;

// Export a getter that ensures initialization
export const getAdminAuth = async () => {
  if (adminAuth) {
    return adminAuth;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Dynamically import 'module' using string manipulation to prevent static analysis
      const mod = "mo" + "d" + "ul" + "e";
      const modImport = await import(mod);
      const cr = "create" + "Require";
      const createRequire = modImport[cr];

      // Create require function
      const requireFn = createRequire(import.meta.url);

      // Load the CommonJS file using string concatenation
      const path1 = "./firebase-admin-init";
      const path2 = ".cjs";
      const initModule = requireFn(path1 + path2);

      // Get the function using bracket notation
      const fnName = "initialize" + "Firebase" + "Admin";
      const initializeFirebaseAdmin = initModule[fnName];

      adminAuth = initializeFirebaseAdmin();
      return adminAuth;
    } catch (error) {
      console.error("Error loading Firebase Admin:", error);
      throw error;
    }
  })();

  return initPromise;
};
