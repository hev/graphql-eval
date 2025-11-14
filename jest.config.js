module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: [
    'test/**/*.js',
    '!test/**/*.test.js'
  ],
  testTimeout: 60000, // GraphQL evals may take time with LLM calls
};
