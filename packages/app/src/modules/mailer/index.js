/* eslint-disable global-require */
import getMailer from '@lskjs/mailer/server';
// import theme from '~/Uapp/theme';

export default app => (
  class Mailer extends getMailer(app) {
    // theme = theme;
    getTemplates() {
      return {
        ...super.getTemplates(),
        authCode: require('./authCode').default,
      };
    }
  }
);
