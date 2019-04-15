// import '../src/polyfill';
import ready from '@lskjs/utils/polyfill';
import App from './App';

ready();

const app = new App({
  config: {
    url: 'http://localhost:3000',
    db: {
      uri: 'mongodb://localhost:27017/lsk',
    },
    log: {
      level: 'trace',
    },
    port: 8080,
    i18: {
      locales: [],
    },
  },
});
app.start();
