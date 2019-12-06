/* eslint-disable global-require */
export default {
  UserModel: require('./UserModelDef').default,
  ChatModelDef: require('./ChatModelDef').default,
  IsicCardModel: require('./IsicCardModelDef').default,
  AuthStatus: require('./AuthStatusDef').default,
  Limit: require('./LimitDef').default,
  MessageModel: require('./MessageModelDef').default,
  ProfileDef: require('./ProfileDef').default,
  LimitsRest: {
    type: 'object',
    properties: {
      eventsCountInMonth: {
        type: 'string',
        format: 'date',
      },
      basicDialogsCountInWeek: {
        type: 'string',
        format: 'date',
      },
    },
  },
  SocialShare: {
    type: 'object',
    properties: {
      vk: {
        type: 'number',
      },
      fb: {
        type: 'number',
      },
    },
  },
  Review: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      profile: {
        type: 'string',
      },
      showDate: {
        type: 'string',
        format: 'date',
      },
    },
  },

  ProfileExtend: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      lat: {
        type: 'number',
      },
      lng: {
        type: 'number',
      },
      language: {
        type: 'string',
      },
      avatar: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      nativeLanguage: {
        type: 'string',
      },
      learningLanguages: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      bdate: {
        type: 'string',
        format: 'date',
      },
      city: {
        type: 'string',
      },
      pubNub: {
        type: 'string',
      },
      socialNetworkType: {
        type: 'string',
      },
      linkToSocialNetwork: {
        type: 'string',
      },
      futureEvents: {
        type: 'array',
        items: {
          $ref: '#/definitions/Event',
        },
      },
    },
  },
  Coordinates: {
    type: 'object',
    properties: {
      lat: {
        type: 'number',
      },
      lng: {
        type: 'number',
      },
    },
  },
  EmailReport: {
    type: 'object',
    properties: {
      accepted: {
        type: 'string',
      },
      rejected: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      response: {
        type: 'string',
      },
      envelop: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
          },
          to: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      messageId: {
        type: 'string',
      },
    },
  },
  AbuserUser: {
    type: 'object',
    properties: {
      profile: {
        $ref: '#/definitions/ProfileExtend',
      },
      text: {
        type: 'string',
      },
      response: {
        type: 'string',
      },
    },
  },
  Request: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
      },
      to: {
        type: 'string',
      },
      place: {
        type: 'string',
      },
      help: {
        type: 'string',
      },
      startDate: {
        type: 'string',
      },
    },
  },
  Error: {
    type: 'object',
    properties: {
      code: {
        type: 'integer',
        format: 'int32',
      },
      message: {
        type: 'string',
      },
      fields: {
        type: 'string',
      },
    },
  },
  Options: {
    type: 'object',
    properties: {
      profile: {
        type: 'string',
      },
      showAvatarOnMap: {
        type: 'boolean',
        default: true,
      },
      newMessagesPush: {
        type: 'boolean',
        default: true,
      },
      AddEditEventsPush: {
        type: 'boolean',
        default: true,
      },
      newParticipantsInEventsPush: {
        type: 'boolean',
        default: true,
      },
      newRequestsPush: {
        type: 'boolean',
        default: true,
      },
      newMessagesEmail: {
        type: 'boolean',
        default: true,
      },
      newRequestsEmail: {
        type: 'boolean',
        default: true,
      },
      AddEditEventsEmail: {
        type: 'boolean',
        default: true,
      },
      appNewsEmail: {
        type: 'boolean',
        default: true,
      },
    },
  },
  Event: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'id event',
      },
      language: {
        type: 'integer',
        format: 'int32',
        description: 'language code',
      },
      title: {
        type: 'string',
        description: 'event title',
      },
      description: {
        type: 'string',
        description: 'event description',
      },
      owner: {
        type: 'string',
        description: 'owner profile id',
      },
      startDate: {
        type: 'string',
        format: 'date-time',
        description: 'YYYY-MM-DDTHH:mm:ss.sssZ',
      },
      wantVisit: {
        type: 'boolean',
        description: 'default value false',
      },
    },
  },
  Participant: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: "jay's id",
      },
      name: {
        type: 'string',
        description: 'place name',
      },
      language: {
        type: 'string',
        description: 'jay`s language',
      },
      avatar: {
        type: 'string',
        description: "link to jay's avatar",
      },
    },
  },
  Place: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'id event',
      },
      photo: {
        type: 'string',
        format: 'byte',
      },
      name: {
        type: 'string',
        description: 'place name',
      },
      address: {
        type: 'string',
        description: 'place address',
      },
      lat: {
        type: 'number',
        format: 'double',
        description: 'latitude',
      },
      lng: {
        type: 'number',
        format: 'double',
        description: 'latitude',
      },
      // "price": {
      //   "type": "integer",
      //   "format": "int32",
      //   "description": "стоимость??"
      // }
    },
  },
  Device: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '',
      },
      type: {
        type: 'string',
        description: '',
      },
      token: {
        type: 'string',
        description: '',
      },
    },
  },
  Cluster: {
    type: 'object',
    properties: {
      centroid: {
        type: 'array',
        items: {
          type: 'number',
        },
        description: 'Координаты',
      },
      count: {
        type: 'number',
        description: 'Количество пользователей в кластере',
      },
    },
  },
};
