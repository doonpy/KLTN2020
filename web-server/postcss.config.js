// Controlling CSS File Size
module.exports = {
    plugins: {
        tailwindcss: {},
        ...(process.env.NODE_ENV === `production`
            ? {
                  '@fullhuman/postcss-purgecss': {
                      content: [`./src/**/*.js`, `./src/**/*.jsx`, `./src/**/*.ts`],
                      defaultExtractor: (content) => {
                          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];

                          // Capture classes within other delimiters like .block(class="w-1/2") in Pug
                          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

                          return broadMatches.concat(innerMatches);
                      },
                  },
                  autoprefixer: {},
              }
            : {}),
    },
};
