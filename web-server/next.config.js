const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: false,
});

module.exports = (phase) => {
    const distDir = '../dist/web/.next';
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    const isProd = phase === PHASE_PRODUCTION_BUILD;
    console.log(`🚀 Node environment: ${isDev ? `Development` : 'Production'}`);
    const env = {
        API_URI: (() => {
            if (isDev) return 'http://localhost:3000';
            if (isProd) return 'http://pk2020.tk:3000';
            return 'API_SERVER_PROTOCO:not (isDev,isProd)';
        })(),
    };

    return withBundleAnalyzer({
        distDir,
        env,
    });
};
