import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/auth-helpers-nextjs']
};

export default nextConfig;