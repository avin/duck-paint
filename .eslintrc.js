module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier'],
  plugins: ['react', 'jsx-a11y', 'import', 'react-hooks'],
  env: {
    browser: true,
    jest: true,
  },
  rules: {
    'no-bitwise': 0,
    'no-unused-vars': [1, { args: 'none', ignoreRestSiblings: true }],
    'no-underscore-dangle': [
      1,
      {
        allow: ['__REDUX_DEVTOOLS_EXTENSION__'],
        allowAfterThis: true,
      },
    ],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-shadow': 0,
    'no-new': 0,
    'no-param-reassign': 0,
    // 'no-bitwise': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'consistent-return': 0,
    'array-callback-return': 0,
    // 'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.fixture.js',
          './src/cosmos.decorator.js',
          './src/setupProxy.js',
          './src/utils/cosmos/*.js',
        ],
      },
    ],
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'react/jsx-wrap-multilines': ['error', { declaration: false }],
    'react/jsx-one-expression-per-line': 0,
    'spaced-comment': ['warn', 'always', { markers: ['/'] }],
    'react/destructuring-assignment': 0,
    curly: ['error', 'all'],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'class-methods-use-this': 0,
  },
  settings: {
    react: {
      version: require('react/package.json').version,
    },
    'import/resolver': {
      alias: [['@', './src']],
    },
  },
};
