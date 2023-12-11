module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    "plugin:react/recommended"

  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', "src/components/ui"],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // 'react/jsx-key': ["warn"],
    "react/react-in-jsx-scope": ["off"],
    "react/no-unescaped-entities": ["off"],
    "react/prop-types": ["off"],

  },
}
