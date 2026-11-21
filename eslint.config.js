import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'backend/**/*', 'data/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
