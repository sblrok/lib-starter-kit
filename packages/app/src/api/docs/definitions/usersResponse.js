/* eslint-disable global-require */

export default {
  schema: {
    type: 'array',
    items: {
      $ref: '#/definitions/UserModel',
    },
  },
  examples: {
    users: [require('./userModelExample').default],
  },
};
