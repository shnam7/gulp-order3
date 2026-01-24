/** @type {import('xo').FlatXoConfig} */

const xoConfig = {
    prettier: true,
    semicolon: false,
    space: true,
    rules: {
        'capitalized-comments': 0,
        'unicorn/prevent-abbreviations': 0,
        'function-paren-newline': 0,
        'implicit-arrow-linebreak': 0,

        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-argument': 0,
    },
}

export default xoConfig
