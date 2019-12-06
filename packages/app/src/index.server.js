// import ready from "./polyfill";
// import './bootstrap.server';
import ready from '@lskjs/utils/polyfill';
import config from './config/server';
import AppServer from './App.server';
// import registerServiceWorker from './registerServiceWorker';

ready();
// process.stdout.write('\x1b[2J');
// process.stdout.write('\x1b[0f');

const app = new AppServer({
  config,
});
app.start();

export default app;
