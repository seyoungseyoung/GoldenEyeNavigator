import type {NextConfig} from 'next';
import path from 'path';

// Define a global symbol to ensure the initialization logic runs only once.
const APP_INITIALIZED = Symbol.for('APP_INITIALIZED');

/**
 * Initializes server-side components like AI flows and schedulers.
 * This function is designed to run only once per server start.
 */
function initializeServer() {
    // @ts-ignore
    if (global[APP_INITIALIZED]) {
        return;
    }
    // @ts-ignore
    global[APP_INITIALIZED] = true;

    console.log("Initializing server modules...");

    // Dynamically import modules to ensure they are loaded in the server environment.
    // Use path aliases (@/) for robust resolution in different environments.
    const { scheduleDailySignalChecks } = require('@/services/emailService');
    require('@/ai/flows/market-insight-analyzer');
    require('@/ai/flows/investment-strategy-generator');
    require('@/ai/flows/stock-signal-generator');
    require('@/ai/flows/subscribeToSignals');
    require('@/ai/flows/ticker-converter');

    // Start the daily email scheduler.
    scheduleDailySignalChecks();
    console.log('Server started and email scheduler is running.');
}


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
    
    // Run server initialization logic only on the server side.
    if (isServer) {
        initializeServer();
    }

    return config;
  },
};

export default nextConfig;
