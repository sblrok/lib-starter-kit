/* eslint-disable global-require */
import BaseUapp from '@lskjs/uapp';
import axios from 'axios';
import Grant from '@lskjs/uapp/Grant';

if (__CLIENT__) {
  // require('./assets/styles.css');
  global.axios = axios;
}

export default class Uapp extends BaseUapp {
  grant = new Grant({ app: this, rules: this.getGrantRules() });
  provide() {
    return {
      ...super.provide(),
      grant: this.grant,
      history: {
        push: () => null,
      },
    };
  }
  getRoutes() {
    return require('./routes').default;
  }

  getGrantRules() {
    return require('./grantRules').default;
  }
  getAsyncModules() {
    return {
      ...super.getAsyncModules(),
      auth: () => import('@lskjs/auth/uapp'),
    };
  }

  getModules() {
    return {
      ...super.getModules(),
      ...require('./modules/uapp').default,
    };
  }
  getStores() {
    return {
      ...super.getStores(),
      ...require('./stores').default(this),
    };
  }
}
