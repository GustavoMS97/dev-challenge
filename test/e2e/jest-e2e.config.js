const baseConfig = require('../jest.config');

module.exports = {
  ...baseConfig,
  testRegex: '.e2e.js$',
  collectCoverageFrom: ['src/domain/**/*.router.js', 'src/domain/**/*.middleware.js'],
  rootDir: '../../'
};
