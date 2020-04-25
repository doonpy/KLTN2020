/* eslint-disable @typescript-eslint/no-var-requires */
const withCSS = require('@zeit/next-css');
const withFonts = require('next-fonts');
const path = require('path');

module.exports = withCSS(
    withFonts({
        webpack(config, { dev }) {
            if (dev) {
                config.module.rules.push({
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'eslint-loader',
                });
            }
            return config;
        },
    })
);

module.exports = {
    distDir: '../dist/web/.next',
};
