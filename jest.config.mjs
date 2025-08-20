export default {
  testEnvironment: 'node',
  // Adapte les glob aux chemins réels de ton code
  collectCoverageFrom: [
    'src/**/*.mjs',
    'src/**/*.js',
    '!src/**/server.*',    // on exclut le bootstrap serveur
    '!src/**/index.*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};
