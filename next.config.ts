import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    // This is to prevent the server from restarting when the subscriptions.json file is modified.
    if (!isServer) {
      config.watchOptions.ignored = [
        ...(config.watchOptions.ignored || []),
        path.resolve(__dirname, 'src/data'),
      ];
    }
    return config;
  },
};

export default nextConfig;
