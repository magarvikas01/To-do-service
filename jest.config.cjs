module.exports = {
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    coveragePathIgnorePatterns: ['/node_modules/'],
  };