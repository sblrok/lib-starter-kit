/* eslint-disable global-require */
const userResponse = {
  description: '',
  schema: {
    type: 'object',
    properties: {
      user: {
        $ref: '#/definitions/User',
      },
    },
  },
};

const optionsDesc = `
  1) showAvatarOnMap - показывать аватар на карте\n
  2) newMessagesPush - Новые сообщения - PUSH\n
  3) AddEditEventsPush - Добавление/изменение групповых встреч - PUSH\n
  4) newParticipantsInEventsPush - Новые участники групповых встреч - PUSH\n
  5) newRequestsPush - Запросы на личные встречи - PUSH\n
  6) newMessagesEmail - Новые сообщения - EMAIL\n
  7) newRequestsEmail - Запросы на личные встречи - EMAIL\n
  8) AddEditEventsEmail - Добавление/изменение групповых встреч - EMAIL\n
  9) appNewsEmail - Новости приложения - EMAIL\n
`;

export default {
  '/users/me': {
    get: {
      summary: 'Получить своего пользователя',
      tags: ['users_me'],
      responses: {
        200: require('../definitions/userResponse').default,
      },
    },
  },
  '/users/me/setProfile': {
    post: {
      summary: 'Изменить параметры пользователя',
      tags: ['users_me'],
      parameters: [
        {
          name: 'name',
          in: 'formData',
          description: 'Имя',
          type: 'string',
          format: 'string',
        },
        {
          name: 'description',
          in: 'formData',
          description: 'Описание',
          type: 'string',
          format: 'string',
        },
        {
          name: 'bdate',
          in: 'formData', // or fromData
          description: 'День рождения в формате YYYY-MM-DD',
          type: 'string',
          format: 'string-date',
        },
        {
          name: 'gender',
          in: 'formData',
          description: 'Пол в формате: male / female',
          type: 'string',
        },
        {
          name: 'nativeLanguages',
          in: 'formData', // or fromData
          description: 'Массив родных языков',
          type: 'array',
          items: {
            type: 'string',
          },
        },
        {
          name: 'learningLanguages',
          in: 'formData', // or fromData
          description: 'Массив изучаемых языков',
          type: 'array',
          items: {
            type: 'string',
          },
        },
        // {
        //   name: 'avatar',
        //   in: 'formData', // or fromData
        //   description: '123',
        //   type: 'blob',
        // },
        // {
        //   name: 'avatar',
        //   in: 'formData', // or fromData
        //   description: 'Аватар (основное фото)',
        //   type: 'ObjectId',
        // },
        {
          name: 'photos',
          in: 'formData', // or fromData
          description: 'Массив фотографий (аватаром будет являться первое фото массива)',
          type: 'array',
          items: {
            type: 'ObjectId',
          },
        },
      ],
      responses: {
        200: require('../definitions/userResponse').default,
      },
    },
  },
  '/users/me/setCoordinates': {
    post: {
      summary: 'Отправка координат пользователя',
      parameters: [
        {
          name: 'lat',
          in: 'formData',
          description: 'latitude',
          required: true,
          type: 'number',
          format: 'double',
        }, {
          name: 'lng',
          in: 'formData',
          description: 'longtitude',
          required: true,
          type: 'number',
          format: 'double',
        },
      ],
      tags: ['users_me'],
      responses: {
        200: {
          description: 'Координаты',
          schema: {
            $ref: '#/definitions/Coordinates',
          },
        },
      },
    },
  },
  '/users/me/setDevice': {
    post: {
      summary: 'Прикрепить устройство с push tokenом к пользователю',
      parameters: [
        {
          name: 'type',
          in: 'formData',
          description: 'android/ios',
          required: true,
          type: 'string',
        }, {
          name: 'token',
          in: 'formData',
          description: 'Push token',
          required: true,
          type: 'string',
        },
      ],
      tags: ['users_me'],
      responses: {
        // 200: {
        //   description: 'Координаты',
        //   schema: {
        //     $ref: '#/definitions/Coordinates',
        //   },
        // },
      },
    },
  },


  // '/users/me/device': {
  //   post: {
  //     summary: 'Добавить устройство пользователя',
  //     parameters: [
  //       {
  //         name: 'id',
  //         in: 'query',
  //         required: false,
  //         type: 'string',
  //       },
  //       {
  //         name: 'token',
  //         in: 'query',
  //         required: true,
  //         type: 'string',
  //       },
  //       {
  //         name: 'type',
  //         in: 'query',
  //         required: true,
  //         type: 'string',
  //       },
  //     ],
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'Profile',
  //         schema: {
  //           $ref: '#/definitions/Profile',
  //         },
  //       },
  //     },
  //   },
  //   delete: {
  //     summary: 'Удалить устройство пользователя',
  //     parameters: [
  //       {
  //         name: 'id',
  //         in: 'query',
  //         required: true,
  //         description: 'id или token',
  //         type: 'string',
  //       },
  //     ],
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'Devices',
  //         schema: {
  //           description: 'Profile',
  //           schema: {
  //             $ref: '#/definitions/Profile',
  //           },
  //         },
  //       },
  //     },
  //   },
  //   get: {
  //     summary: 'Найти все устройства польхователя',
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'Devices',
  //         schema: {
  //           type: 'array',
  //           items: {
  //             $ref: '#/definitions/Device',
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  // '/users/me/social/share': {
  //   post: {
  //     summary: 'Сообщить о шаринге в соц.сети',
  //     parameters: [
  //       {
  //         name: 'socialNetworkType',
  //         in: 'formData',
  //         required: true,
  //         type: 'string',
  //       },
  //       {
  //         name: 'linkToSocialNetwork',
  //         in: 'formData',
  //         required: true,
  //         type: 'string',
  //       },
  //     ],
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'SocialShare',
  //         schema: {
  //           $ref: '#/definitions/SocialShare',
  //         },
  //       },
  //     },
  //   },
  //   get: {
  //     summary: 'Взять данные о шаринге в соц.сетях',
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'SocialShares',
  //         schema: {
  //           type: 'array',
  //           items: {
  //             $ref: '#/definitions/SocialShare',
  //           },
  //         },
  //       },
  //     },
  //   },
  // },


  // '/users/me/options': {
  //   get: {
  //     summary: 'Получить настроки юзера',
  //     description: optionsDesc,
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: 'Options',
  //         schema: {
  //           $ref: '#/definitions/Options',
  //         },
  //       },
  //     },
  //   },
  //   put: {
  //     summary: 'Изменить настроки юзера',
  //     description: optionsDesc,
  //     tags: ['users_me'],
  //     parameters: [
  //       {
  //         name: 'showAvatarOnMap',
  //         in: 'formData',
  //         description: 'Показывать аватар на карте',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'newMessagesPush',
  //         in: 'formData',
  //         description: 'Новые сообщения - PUSH',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'AddEditEventsPush',
  //         in: 'formData',
  //         description: 'Добавление/изменение групповых встреч - PUSH',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'newParticipantsInEventsPush',
  //         in: 'formData',
  //         description: 'Новые участники групповых встреч - PUSH',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'newRequestsPush',
  //         in: 'formData',
  //         description: 'Запросы на личные встречи - PUSH',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'newMessagesEmail',
  //         in: 'formData',
  //         description: 'Новые сообщения - EMAIL',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'newRequestsEmail',
  //         in: 'formData',
  //         description: 'Запросы на личные встречи - EMAIL',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'AddEditEventsEmail',
  //         in: 'formData',
  //         description: 'Добавление/изменение групповых встреч - EMAIL',
  //         required: false,
  //         type: 'boolean',
  //       },
  //       {
  //         name: 'appNewsEmail',
  //         in: 'formData',
  //         description: 'Новости приложения - EMAIL',
  //         required: false,
  //         type: 'boolean',
  //       },
  //     ],
  //     responses: {
  //       200: {
  //         description: 'Options',
  //         schema: {
  //           $ref: '#/definitions/Options',
  //         },
  //       },
  //     },
  //   },
  // },


  // '/options/option/{name}': {
  //   parameters: [
  //     {
  //       name: 'name',
  //       in: 'path',
  //       required: true,
  //       type: 'string',
  //       description: 'Тип настройки',
  //     },
  //   ],
  //   get: {
  //     summary: 'Получить инфо о конкретной настройке',
  //     description: '',
  //     tags: ['options'],
  //     responses: {
  //       200: {
  //         description: 'Options',
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             option: {
  //               type: 'boolean',
  //               default: false,
  //             },
  //           },
  //           option: '#/definitions/Options',
  //         },
  //       },
  //     },
  //   },
  // },

  // '/user/setPhone': {
  //   post: {
  //     summary: '123',
  //     parameters: [
  //       {
  //         name: 'phone',
  //         in: 'formData',
  //         description: '123',
  //         required: true,
  //         type: 'string',
  //       },
  //     ],
  //     tags: ['users_me'],
  //     responses: {
  //       200: {
  //         description: '',
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             permit: {
  //               type: 'string',
  //             },
  //             permitId: {
  //               type: 'string',
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  // '/user/setEmail': {
  //   post: {
  //     summary: '123',
  //     parameters: [
  //       {
  //         name: 'email',
  //         in: 'formData',
  //         description: '123',
  //         required: true,
  //         type: 'string',
  //       },
  //     ],
  //     tags: ['users_me'],
  //     responses: {
  //       200: userResponse
  //     },
  //   },
  // },
};
