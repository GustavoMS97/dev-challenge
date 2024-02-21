module.exports = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'test/coverage/',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src-old/',
    'server.js',
    'main.js',
    '.model.js',
    '.enum.js',
    'express.js',
    'sequelize.js'
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  },
  testRegex: '.(spec|e2e).js$',
  rootDir: '../',
  roots: ['<rootDir>/src/', '<rootDir>/test/']
};
