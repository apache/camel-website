module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/src/js/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
}
