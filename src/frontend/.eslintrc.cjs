module.exports = {
    "root": true,
    "settings": {
      "react": {
        "version": "detect"
      },
    },
    "env": {
        "es6": true,
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:tailwindcss/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "ecmaFeatures": {
          "jsx": true,
          "impliedStrict": true,
          "experimentalObjectRestSpread": true
        }
    },
    "ignorePatterns": [
      "node_modules/*", 
      "dist/*"
    ],
    "plugins": [
        "react",
        "react-hooks",
        "tailwindcss"
    ],
    "rules": {
      /*
      "no-console": [
        "error",
        {
          "allow": ["error"]
        }
      ],*/
      "tailwindcss/no-contradicting-classname": [1],
      "tailwindcss/classnames-order": [ 1 ],
       "tailwindcss/no-custom-classname": [1, 
        { 
          "whitelist": [
            "sr-hidden", "text-e8-razzmatazz", "text-u-green-success",
            "text-e8-black", "shadow-form-field-dark", "shadow-form-field-light",
            "text-u-snow", "text-e8-sea-buckthorn", "text-shadow-inset-xs", "text-shadow-inset",
            "bg-e8-meteorite", "bg-e8-picton-blue", "themed-font-text", "gradient-mask-t-10"
          ] 
       }],
      "no-const-assign": 2,
      "no-extra-semi": 0,
      "no-undef": "warn",
      "no-unreachable": "warn",
      "no-unsafe-finally": "warn",
      "no-unused-vars": 0,
      
      "no-unused-expressions": [
        "warn",
        {
          "allowShortCircuit": false,
          "allowTernary": true
        }
      ],
      "react/no-array-index-key": "warn",
      "prefer-const": "warn",
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": 0,
      "react/no-unused-state": "warn",
      "react/react-in-jsx-scope": 0,
      //"semi": ["warn", "always"]
    }
}
