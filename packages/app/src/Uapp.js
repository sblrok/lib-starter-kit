/* eslint-disable global-require */
import BaseUapp from '@lskjs/uapp';
import axios from 'axios';

if (__CLIENT__) {
  // require('./assets/styles.css');
  global.axios = axios;
}

export default class Uapp extends BaseUapp {
  provide() {
    return {
      ...super.provide(),
      history: {
        push: () => null,
      },
    };
  }
  getRoutes() {
    return require('./routes').default;
  }
  async init() {
    await super.init();
    this._async_modules = {};
  }
  async module(name) {
    console.log('module', name);
    if (this._async_modules[name]) return this._async_modules[name];
    if (name === 'auth') {
      const { default: Auth } = await import('@lskjs/auth/uapp');
      console.log({ Auth });
      // console.log(123123123);
      const auth = new Auth(this);
      console.log({ auth });
      // const auth = new Auth();
      if (auth.init) {
        console.log('auth.init');
        await auth.init();
      }
      

      this._async_modules = auth;
      console.log('module', name, 'SUCCESS');

      return auth;
    }
    return null;
  }
  getModules() {
    return {
      ...super.getModules(),
      ...require('./modules/uapp').default,
    };
  }
  getStores() {
    this.stores = super.getStores();
    return {
      ...this.stores,
      ...require('./stores').default(this),
    };
  }
}
