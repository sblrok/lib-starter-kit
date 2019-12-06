import ready from '@lskjs/utils/polyfill';
// import proxy from 'http-proxy-middleware';
import ReactApp from '@lskjs/reactapp';
import Uapp from './Uapp';
import config from './config/client';

ready();

const app = new ReactApp({
  Uapp,
  config,
});
// console.log(app, 'app');
// app.use(proxy('/api', { target: 'http://localhost:8080' }));
global.app = app;

window.onload = async () => {
  await app.start();
};

export default app;
