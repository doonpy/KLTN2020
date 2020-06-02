module.exports = {
  important: true,
  purge: ['./web-server/pages/**/*.js','./web-server/components/**/*.js'],
  theme: {
    darkSelector: '.dark-mode',
    backgroundColor: (theme) => ({
      ...theme('colors'),
      dark: '#191919',
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      'dark-primary': '#707070',
    }),

    extend: {},
  },
  variants: {
     backgroundColor: ['dark', 'responsive', 'hover', 'focus'],
     borderColor: [
      'dark',
      'dark-focus-within',
      'responsive',
      'hover',
      'focus',
      'focus-within',
    ],
    textColor: ['dark', 'responsive', 'hover', 'focus'],
    borderWidth: ['dark', 'responsive'],
  },
  plugins: [require('tailwindcss-dark-mode')()],
}
