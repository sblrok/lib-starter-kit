export default {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
      format: 'date',
    },
    createdAt: {
      type: 'string',
      format: 'date',
    },
    email: {
      type: 'string',
    },
    socialNetworkType: {
      type: 'string',
    },
    linkToSocialNetwork: {
      type: 'string',
    },
    devices: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          token: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          _id: {
            type: 'string',
          },
        },
      },
    },
    _lastVisitedAt: {
      type: 'string',
      format: 'date',
    },
    lastMessageObject: {},
    chatAvailable: {
      type: 'boolean',
    },
    offerHelp: {
      type: 'string',
    },
    askHelp: {
      type: 'string',
    },
    futureEvents: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    city: {
      type: 'string',
    },
    avatar: {
      type: 'string',
    },
    bdate: {
      type: 'string',
      format: 'date',
    },
    learningLanguages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    nativeLanguage: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    firstName: {
      type: 'string',
    },
    __v: {
      type: 'number',
    },
    loc: {
      type: 'array',
      items: {
        type: 'number',
        format: 'double',
      },
    },
    deleted: {
      type: 'boolean',
    },
    photos: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    accountType: {
      type: 'string',
    },
    premiumExpiredAt: {
      type: 'string',
      format: 'date',
    },
    blocked: {
      type: 'boolean',
    },
  },
};
