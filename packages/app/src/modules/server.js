/* eslint-disable global-require */
export default (...args) => ({
  auth: require('@lskjs/auth/server').default(...args),
  permit: require('@lskjs/permit/server').default(...args),
  mailer: require('./mailer').default(...args),
  upload: require('@lskjs/upload/server').default(...args),
  // chat: require('./chat').default(...args),
});
