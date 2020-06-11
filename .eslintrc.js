module.exports = {
    extends: [
        '@cybozu/eslint-config/presets/react-prettier',
        '@cybozu/eslint-config/presets/node-typescript-prettier',
    ],
    rules: {
        'prefer-const': 'warn',
        '@typescript-eslint/array-type': 'off',
        'node/no-missing-import': 'off',
    },
    overrides: [
        // DO NOT ADD MORE FILES TO THE IGNORE LIST
        // TODO: We should fix the errors
        ...require('./web-server/.eslint_ignore_rules.js'),
        ...require('./api-server/.eslint_ignore_rules.js'),
    ],
};
