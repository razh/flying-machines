module.exports = {
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  parserOptions: {
    "sourceType": "module"
  },
  "rules": {
    "comma-dangle": [2, "always-multiline"],
    "comma-spacing": 0,
    "consistent-return": 0,
    "indent": [2, 2],
    "key-spacing": 0,
    "no-multi-spaces": 0,
    "no-shadow": 0,
    "strict": [0, "never"],
    "quotes": [2, "single", "avoid-escape"],
    "yoda": 0
  }
};