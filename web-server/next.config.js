const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
const path = require('path');

module.exports = (phase) => {
    const distDir = '../dist/web/.next';
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    const isProd = phase === PHASE_PRODUCTION_BUILD;
    console.log(`🚀🚀🚀🚀🚀 Node environment:${isDev ? `Development` : 'Prod'}`);
    const env = {
        API_URI: (() => {
            if (isDev) return 'http://localhost:3000';
            if (isProd) return 'http://pk2020.tk';
            return 'API_SERVER_PROTOCO:not (isDev,isProd)';
        })(),
    };

    const config = {
        webpack: function (config, { dev }) {
            config.resolve.alias[package.name] = path.resolve(__dirname, 'web-server');
            console.log(path)
            config.module.rules.push({
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000,
                        name: '[name].[ext]',
                    },
                },
            });

            return config;
        },
    };

    return {
        distDir,
        env,
        config,
    };
};
