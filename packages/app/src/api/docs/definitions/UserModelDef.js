export default {
  type: 'object',
  properties: {
    email: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    bdate: {
      type: 'string',
      format: 'string-date',
    },
    nativeLanguages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    learningLanguages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    desciption: {
      type: 'string',
    },
    photos: {
      type: 'array',
      items: {
        type: 'ObjectId',
      },
    },
    accountStatus: {
      type: 'enum',
      items: {
        type: 'string',
        properties: {
          BASIC: {
            type: 'string',
          },
          ISIC: {
            type: 'string',
          },
          PREMIUM: {
            type: 'string',
          },
        },
      },
    },
    loc: {
      type: 'array',
      items: {
        type: 'double',
        properties: {
          lng: {
            type: 'double',
          },
          lat: {
            type: 'double',
          },
        },
      },
    },
    avatar: {
      type: 'string',
    },
    // firstName: {
    //   type: 'string',
    // },
    // lastName: {
    //   type: 'string',
    // },
    city: {
      type: 'string',
    },
    _city: {
      id: {
        type: 'ObjectId',
      },
      title: {
        type: 'string',
      },
    },
    deleted: {
      type: 'boolean',
    },
    blocked: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    lastVisitedAt: {
      type: 'string',
      format: 'string-date',
    },
  },
};
