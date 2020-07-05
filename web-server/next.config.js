const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants');
const path = require('path');
const withFonts = require('next-fonts');

module.exports = (phase) => {
    const distDir = '../dist/web/.next';
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    const isProd = phase === PHASE_PRODUCTION_BUILD;
    console.log(`🚀 Mode: ${isDev ? `Development` : 'Production'}`);
    const env = {
        WEB_URI: (() => {
            if (isDev) {
                return 'http://localhost:3001';
            }

            if (isProd) {
                return 'http://pk2020.tk';
            }
            return 'WEB_URI is invalid!';
        })(),
        API_URI: (() => {
            if (isDev) {
                return 'http://localhost:3000';
            }

            if (isProd) {
                return 'http://pk2020.tk:3000';
            }
            return 'API_URL is invalid!';
        })(),
        MAP_BOX_KEY: (() => {
            if (isDev) {
                return 'pk.eyJ1IjoiZG9vbnB5IiwiYSI6ImNrYW9xd3hjcTB3a3Eycm1vNHhzY250c2sifQ.Ti9ktyjr224DM5eDsXftfQ';
            }

            if (isProd) {
                return 'pk.eyJ1IjoiZG9vbnB5IiwiYSI6ImNrYW9xd3hjcTB3a3Eycm1vNHhzY250c2sifQ.Ti9ktyjr224DM5eDsXftfQ';
            }
            return 'MAP_BOX_KEY is invalid!';
        })(),
    };

    const webpack = function (config, { dev }) {
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
        config.resolve.alias['~'] = path.resolve(__dirname + '/src');
        return config;
    };

    return withFonts({
        distDir,
        env,
        webpack,
    });
};
