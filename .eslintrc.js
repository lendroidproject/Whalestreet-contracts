module.exports = {
    root: true,
    extends: "eslint:recommended",
    env: {
        "node": true,
        "es6": true
    },
    parserOptions: {
        "ecmaVersion": 2019
    },
    rules: {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "always" ],
        "no-undef" : 0,
        "no-console": 0,
        "max-len": 0
    }
};
