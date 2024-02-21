const baseConfig = require('../jest.config');

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: [...baseConfig.coveragePathIgnorePatterns, '.middleware.js', '.router.js'],
  testRegex: '.spec.js$',
  rootDir: '../../'
};
