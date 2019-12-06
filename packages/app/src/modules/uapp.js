/* eslint-disable global-require */
export default (...args) => ({
  auth: require('@lskjs/auth/uapp').default(...args),
  // permit: require('@lskjs/permit/server').default(...args),
  // mailer: require('@lskjs/mailer/server').default(...args),
  // upload: require('@lskjs/upload/server').default(...args),
  // chat: require('./chat').default(...args),
});
