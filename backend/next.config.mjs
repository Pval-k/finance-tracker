/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ["firebase-admin"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize firebase-admin and all its submodules
      const originalExternals = config.externals;
      config.externals = [
        ...(Array.isArray(originalExternals)
          ? originalExternals
          : originalExternals
          ? [originalExternals]
          : []),
        ({ request }, callback) => {
          if (
            request &&
            typeof request === "string" &&
            request.startsWith("firebase-admin")
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
