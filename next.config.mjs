/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — keep it out of the bundle so it
  // loads via require() at runtime on the server.
  serverExternalPackages: ["better-sqlite3"],
  // This project has its own lockfile; pin the workspace root to itself so
  // Next.js doesn't guess a parent directory.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
