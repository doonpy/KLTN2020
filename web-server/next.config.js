const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
const withCSS = require('@zeit/next-css');

module.exports = (phase) => {
    const distDir = '../dist/web/.next';
    // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    // when `next build` or `npm run build` is used
    const isProd = phase === PHASE_PRODUCTION_BUILD;
    console.log(`[==>Start:  ] Development: ${isDev}  Production:${isProd} `);

    const env = {
        API_SERVER_PROTOCOL: (() => {
            if (isDev) return 'http';
            if (isProd) return 'https';
            return 'API_SERVER_PROTOCO:not (isDev,isProd)';
        })(),
        API_SERVER_IP: (() => {
            if (isDev) return '127.0.0.1';
            if (isProd) return 'pk2020.tk';
            return 'API_SERVER_PROTOCO:not (isDev,isProd)';
        })(),
        API_SERVER_PORT: (() => {
            if (isDev) return '3000';
            if (isProd) return '3000';
            return 'API_SERVER_PROTOCO:not (isDev,isProd)';
        })(),
    };

    // next.config.js object
    return {
        distDir,
        env,
        webpack(config, { isServer }) {
            config.module.rules.push({
                test: /\.(txt|png|svg|gif|bmp|jpe?g|ttf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            context: '',
                            outputPath: 'static',
                            publicPath: '/_next/static',
                            name: 'assets/[name].[hash:8].[ext]',
                            limit: 1024 * 30, // 20kb
                            esModule: false,
                        },
                    },
                ],
            });
            if (!isServer) {
                config.node = {
                    fs: 'empty',
                };
            }
            return config;
        },
    };
};
