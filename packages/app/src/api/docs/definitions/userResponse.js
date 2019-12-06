/* eslint-disable global-require */

export default {
  schema: {
    $ref: '#/definitions/UserModel',
  },
  examples: {
    user: require('./userModelExample').default,
  },
};
