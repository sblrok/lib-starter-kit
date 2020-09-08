module.exports = {
  verbose: true,
  testURL: 'http://localhost:3000',
  transform: {
    '^.+\\.jsx?$|^.+\\.tsx?$': '<rootDir>/babel-jest.config.js',
  },
  globals: {
    __DEV__: false,
  },
  collectCoverageFrom: ['packages/**/src/*.js'],
};

// TODO: SSR
// const React = require('react');
// const ReactDomServer = require('react-dom/server');

// module.exports = {
//   verbose: true,
//   testURL: 'http://localhost:3000',
//   transform: {
//     '^.+\\.jsx?$': '<rootDir>/babel-jest.config.js',
//   },
//   moduleNameMapper: {
//     '^[./a-zA-Z0-9$_-]+\\.(png|css)$': '<rootDir>/jest_image.js',
//   },
//   globals: {
//     __DEV__: false,
//     React,
//     ssr: el => ReactDomServer.renderToString(el),
//     storybookMock: () => {
//       const mock = {
//         storiesOf: () => mock,
//         add: (name, callback) => {
//           ReactDomServer.renderToString(callback());
//           return mock;
//         },
//       };
//       return mock;
//     },
//   },
// };
