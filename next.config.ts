import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const root = path.dirname(fileURLToPath(import.meta.url));

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Vehicle photos live in the public Supabase bucket.
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  cacheComponents: true,
  // The rent request form uploads a photo of the Ghana Card (shrunk in the browser, so well under this).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  partialPrefetching: true,
  turbopack: {
    root,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
