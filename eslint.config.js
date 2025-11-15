import js from '@eslint/js';
import react from 'eslint-plugin-react';

export default [
  {
    files: ['Index/**/*.js'],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        // Turn EVERYTHING into readonly to avoid false positives
        window: 'readonly',
        document: 'readonly',
        React: 'readonly',
        useState: 'readonly',
        useEffect: 'readonly',
        useRef: 'readonly',
        firebase: 'readonly',
        db: 'readonly',
        auth: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      // ONLY CHECK SYNTAX - not undefined variables
      'no-undef': 'off',           // Turn off - too many false positives
      'no-unused-vars': 'off',     // Turn off - too many false positives
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off'
    }
  }
];
