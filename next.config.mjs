import { createRequire } from 'module'
const require = createRequire(import.meta.url)
let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,  
    parallelServerCompiles: true,
    // Desabilitando temporariamente para resolver problemas com critters
    // optimizeCss: true,
    optimizeServerReact: true,
    turbo: {
      resolveAlias: {
        canvas: './empty-module.js',
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@codemirror/state': require.resolve('@codemirror/state'),
      '@codemirror/view': require.resolve('@codemirror/view'),
      '@codemirror/language': require.resolve('@codemirror/language'),
      '@codemirror/autocomplete': require.resolve('@codemirror/autocomplete'),
      '@codemirror/search': require.resolve('@codemirror/search'),
      '@codemirror/commands': require.resolve('@codemirror/commands'),
      '@codemirror/lint': require.resolve('@codemirror/lint'),
      '@codemirror/theme-one-dark': require.resolve('@codemirror/theme-one-dark'),
      '@codemirror/lang-javascript': require.resolve('@codemirror/lang-javascript'),
      '@codemirror/lang-python': require.resolve('@codemirror/lang-python'),
      '@codemirror/lang-sql': require.resolve('@codemirror/lang-sql'),
      '@codemirror/lang-markdown': require.resolve('@codemirror/lang-markdown'),
    }
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 300,
      poll: 1000,
    };
    
    config.output = {
      ...config.output,
      chunkLoadTimeout: 60000,
    };
    
    return config;
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
