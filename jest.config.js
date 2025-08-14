// jest.config.js (ESM)
export default {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/\\.backup-.*'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['text', 'lcov'],
  transform: {}
};
