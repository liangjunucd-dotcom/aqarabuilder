const isGithubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages ? '/aqarabuilder' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? '/aqarabuilder' : '',
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
