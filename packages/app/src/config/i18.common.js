/* eslint-disable global-require */
export default {
  debug: __DEV__,
  whitelist: require('./locales').default,
  locales: require('./locales').default,
  fallbackLng: __DEV__ ? null : require('./locales').default[0],
};
