module.exports = {
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ["configs/", ".mock.js"],
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  moduleNameMapper: {
    "^(.*)\\.js$": "$1.js"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)"
  ],
  globals: {
    'babel-jest': {
      useESM: true
    }
  },
};
