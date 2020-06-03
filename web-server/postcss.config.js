const purgecss = [
    '@fullhuman/postcss-purgecss',
    {
        content: [
            './components/**/*.js',
            './pages/**/*.js',
            './components/*.js',
            './pages/*.js',
        ],
        defaultExtractor: (content) => {
            const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
            const innerMatches =
                content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

            return broadMatches.concat(innerMatches);
        },
    },
];

module.exports = {
    plugins: [
        'postcss-preset-env',
        'tailwindcss',
        'autoprefixer',
        'cssnano',
        ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
    ],
};
