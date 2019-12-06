// TODO: global-require - вынести в либ стартер кит
/* eslint-disable global-require */
import config from '@lskjs/config';

export default config({
  // url: 'http://localhost:3000',
  url: 'http://localhost:8080',
  db: {
    debug: true,
  },
  log: {
    level: 'trace',
  },
  port: 8080,
  i18: require('./i18.server').default,
  about: require('./about').default,
  middlewares: {
    accessLogger: true,
    reqData: true,
    cookieParser: true,
    bodyParser: {
      json: true,
      urlencoded: true,
    },
    cors: true,
  },
  upload: {},
  jwt: {},
  mailer: {},
  ws: {},
  env: process.env.NODE_ENV || process.env.ENV || 'development',

});
