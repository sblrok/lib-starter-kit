const authPermitResponse = {
  description: 'Новый сгенерированный токен, пользователь и стату',
  schema: {
    type: 'object',
    properties: {
      permitId: {
        type: 'string',
      },
    },
  },
};
// const authPermitResponse = {
//   description: 'Новый сгенерированный токен, пользователь и стату',
//   schema: {
//     type: 'object',
//     properties: {
//       token: {
//         type: 'string',
//       },
//       status: {
//         $ref: '#/definitions/StatusDef',
//       },
//       user: {
//         $ref: '#/definitions/UserModel',
//       },
//     },
//   },
// };
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
        $ref: '#/definitions/AuthStatus',
      },
    },
  },
};

export default {
  '/auth/facebook': {
    post: {
      summary: 'Авторизация, регистрация или привязка фейсбук',
      parameters: [
        {
          name: 'access_token',
          in: 'formData',
          description: 'EAACqLfQTGisBAITZBqYFlMqxp0ENQolqYfohC9IlvjFWQ89bA8gKXkboVRbZBJ0BBqf2dXZBK6jkkZA2CcEAkbLJZCI8srKGl7Q75zcd8A3mtYn69ZC0yll17BWP8YMSekIXsue6eK21oSgYslRAQp9lf8PUdITJK69733iNqzDyINiBfWjV1S85dB3UIujkRYNBNtzRtuxuV7e6dD9RsiJxgMZCyGAydfIb6ErIb5zFt3fKaZAvmHji',
          required: true,
          type: 'string',
        },
      ],
      tags: ['auth'],
      responses: {
        200: authResponse,
      },
    },
  },
  '/auth/accountkit': {
    post: {
      summary: 'Авторизация, регистрация или привязка номера телефона (через accountkit)',
      parameters: [
        {
          name: 'access_token',
          in: 'formData',
          description: 'EMAWd5vpcB00q3fA7VXZCwt1ngo2xmTZCZAi4E1ibiujiveZCBZBxhDwY4k4i5eagNYaPZBRLUM1NJWZCZBayWnCtjDVyaIx1s3fBvstE44fr2qgZDZD',
          required: true,
          type: 'string',
        },
      ],
      tags: ['auth'],
      responses: {
        200: authResponse,
      },
    },
  },
  '/auth/phone': {
    post: {
      summary: 'Авторизация, регистрация или привязка через телефон',
      parameters: [
        {
          name: 'phone',
          in: 'formData', // or fromData
          description: 'Телефон в международном формате, можно с лишними символами, бек возьмет только цифры (код страны обязателен)',
          required: true,
          type: 'string',
        },
      ],
      tags: ['auth'],
      responses: {
        200: authPermitResponse,
      },
    },
  },
  '/auth/email': {
    post: {
      summary: 'Авторизация, регистрация или привязка через email',
      parameters: [
        {
          name: 'email',
          in: 'formData',
          description: 'Email, можно в разном регистре, бек приведет все к нижнему',
          required: true,
          type: 'string',
        },
      ],
      tags: ['auth'],
      responses: {
        200: authPermitResponse,
      },
    },
  },
  '/auth/confirm': {
    post: {
      summary: 'Подтверждение емейла или телефона одноразовым кодом',
      parameters: [
        {
          name: 'code',
          in: 'formData',
          description: '123',
          required: true,
          type: 'string',
        },
        {
          name: 'permitId',
          in: 'formData',
          description: '123',
          required: true,
          type: 'string',
        },
      ],
      tags: ['auth'],
      responses: {
        200: authResponse,
      },
    },
  },
  '/auth/status': {
    get: {
      summary: 'Прикладывая токен к запросу получаем пользователя и его статус',
      tags: ['auth'],
      parameters: [
      ],
      responses: {
        200: authResponse,
      },
    },
  },
  '/auth/check': {
    get: {
      summary: 'Проверить занят ли email или phone',
      tags: ['auth'],
      parameters: [
        {
          name: 'email',
          in: 'query',
          description: 'email',
          type: 'string',
        },
        {
          name: 'phone',
          in: 'query',
          description: 'phone',
          type: 'string',
        },
      ],
      responses: {
        200: {
          ok: {
            description: 'exists=true если в найден в базе',
            schema: {
              type: 'object',
              properties: {
                exists: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  },
};
