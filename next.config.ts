import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGithubPages ? "/gobuzz" : "");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  ...(isGithubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        images: {
          unoptimized: true,
        },
      }
    : {
        serverExternalPackages: ["better-sqlite3"],
        outputFileTracingRoot: __dirname,
      }),
};

export default nextConfig;
