module.exports = {
    important: true,
    purge: {
        enabled: true,
        content: [
            './web-server/pages/**/*.jsx',
            './web-server/components/**/*.jsx',
        ],
    },
    theme: {
        darkSelector: '.dark-mode',
        backgroundColor: (theme) => ({
            ...theme('colors'),
            dark: '#191919',
        }),
        borderColor: (theme) => ({
            ...theme('colors'),
            primary: '#707070',
            'light-primary': 'rgba(0,0,0,.0625)',
        }),
        textColor: (theme) => ({
            ...theme('colors'),
            light: '#72777a',
        }),
        extend: {},
    },
    variants: {
        backgroundColor: ['dark', 'responsive', 'hover', 'focus'],
        borderColor: ['dark', 'responsive', 'hover'],
        textColor: ['dark', 'responsive', 'hover', 'focus'],
        borderWidth: ['dark', 'responsive'],
    },
    plugins: [require('tailwindcss-dark-mode')()],
};
