const authPermitResponse = {
  description: 'Новый сгенерированный токен, пользователь и стату',
  schema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
      },
      status: {
        $ref: '#/definitions/StatusDef',
      },
      user: {
        $ref: '#/definitions/UserModel',
      },
    },
  },
};
const authResponse = {
  description: 'Новый сгенерированный токен, пользователь и его статус',
  schema: {
    type: 'object',
    properties: {
      isNew: {
        type: 'boolean',
      },
      operation: {
        type: 'string',
      },
      token: {
        type: 'string',
      },
      user: {
        $ref: '#/definitions/UserModel',
      },
      status: {
        $ref: '#/definitions/StatusDef',
      },
    },
  },
};

export default {
  '/admin/users/remove': {
    post: {
      summary: 'Находит пользователя id, email, phone и удаляет его',
      parameters: [
        {
          name: '_id',
          in: 'formData',
          description: 'id пользователя',
          type: 'string',
        },
        {
          name: 'email',
          in: 'formData',
          description: 'email пользователя',
          type: 'string',
        },
        {
          name: 'phone',
          in: 'formData',
          description: 'phone',
          type: 'string',
        },
      ],
      tags: ['admin'],
      responses: {
        200: authResponse,
      },
    },
  },
};
