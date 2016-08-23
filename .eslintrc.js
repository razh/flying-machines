module.exports = {
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2],
    quotes: ['error', 'single', 'avoid-escape'],
  },
};
