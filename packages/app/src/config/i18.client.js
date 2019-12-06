/* eslint-disable global-require */
export default {
  ...require('./i18.common').default,
  resources: require('./i18.resources').default,
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
};
