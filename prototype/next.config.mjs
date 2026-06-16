const isGithubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages ? '/aqara-builder' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
