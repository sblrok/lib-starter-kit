/* eslint-disable global-require */
export default {
  url: 'http://localhost:3000',
  api: {
    trace: true,
    url: __DEV__ ? 'http://localhost:8080' : null,
    base: '/api/v5',
    ws: {
      url: __DEV__ ? 'http://localhost' : null,
      port: __DEV__ ? 8080 : null,
      base: '/api',
      options: {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket'],
        // transports: ['xhr-polling'],
      },
    },
  },
  ws: __DEV__ ? {
    url: 'http://localhost:8080',
  } : null,
  db: {
  },
  log: {
    level: 'trace',
  },
  port: 8080,
  i18: require('./i18.client').default,
  about: require('./about').default,
};
