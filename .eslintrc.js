module.exports = {
  root: true,
  rules: {
    'no-console': 0,
    'no-extra-semi': 0,
    'no-case-declarations': 1,
    'no-unused-vars': 'error',
    'no-async-promise-executor': 1,
    semi: ['error', 'never'],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    'prettier/prettier': 'error',
  },
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  parser: 'babel-eslint',
}
