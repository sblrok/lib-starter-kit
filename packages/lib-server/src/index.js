// import '../src/polyfill';
import ready from '@lskjs/utils/polyfill';
import App from './App';

ready();

const app = new App({
  config: {
    port: 8080,
    i18: {
      locales: [],
    },
  },
});
app.start();
