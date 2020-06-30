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
        backgroundColor: (theme) => ({
            ...theme('colors'),
            dark: '#191919',
            primary: '#242e3e',
            hover: '#212A39',
            'dark-gray': '#272E48',
            'dark-bg': '#1A233A',
            'green-light': '#0bb783',
            'white-bg': '#f3f6f9',
        }),
        borderColor: (theme) => ({
            ...theme('colors'),
            primary: '#707070',
            'light-primary': 'rgba(0,0,0,.0625)',
            'dark-gray': '#464D5',
            hover: '#2196f3',
            'green-light': '#0bb783',
        }),
        textColor: (theme) => ({
            ...theme('colors'),
            light: '#72777a',
            //
            fill: '#b5b5c3',
            dark: '#3f4254',
            primary: '#0bb783',
            danger: '#f64e60',
        }),
        extend: {},
    },
};
