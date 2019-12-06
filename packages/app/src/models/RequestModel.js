// import getPlacesApi from '../../api/v1/place/place.api'
import MongooseSchema from '@lskjs/db/MongooseSchema';
import pick from 'lodash/pick';

export function getSchema(app) {
  const { db } = app;

  // const placesApi = getPlacesApi(ctx);
  const schema = new MongooseSchema({
    fromUserId: {
      required: true,
      type: db.Schema.Types.ObjectId,
      ref: 'User', // ctx.models.getName()
    },
    toUserId: {
      required: true,
      type: db.Schema.Types.ObjectId,
      ref: 'User', // ctx.models.getName()
    },
    chatId: {
      type: db.Schema.Types.ObjectId,
      ref: 'Chat', // ctx.models.getName()
    },
    status: {
      type: String,
      enum: [
        null, 'accept', 'reject', 'cancel',
      ],
      default: null,
    },
    statusedAt: {
      type: Date,
    },
    language: {
      type: String,
    },
    help: {
      // required: true,
      type: String,
      enum: [null, 'help_me', 'help_you'],
    },
    info: { },
  }, {
    collection: 'request',
    model: 'Request',
  });

  schema.virtual('isOnline').get(() => true);
  schema.methods.toJsonForProfile = function (profileId) {
    const request = this.toJSON();
    if (request.place && request.place.address) {
      request.address = request.place.address;
    } else {
      request.address = '';
    }
    if (request.from && request.from._id && request.from._id !== profileId) {
      request.firstName = request.from.firstName;
      request.lastName = request.from.lastName;
      request.avatar = request.from.avatar;
      request.profile = request.from._id;
      request.language = request.from.nativeLanguage;
      if (request.from && request.from.avatar) {
        if (request.from.avatar[0] === '/') {
          request.avatar = `${app.config.protocol}://${app.config.host + request.from.avatar}`;
        } else {
          request.avatar = request.from.avatar;
        }
      }
    } else {
      request.firstName = request.to.firstName;
      request.lastName = request.to.lastName;
      request.avatar = request.to.avatar;
      request.profile = request.to._id;
      request.language = request.to.nativeLanguage;
      if (request.from && request.from.avatar) {
        if (request.from.avatar[0] === '/') {
          request.avatar = `${app.config.protocol}://${app.config.host + request.from.avatar}`;
        } else {
          request.avatar = request.from.avatar;
        }
      }
    }
    return request;
  };

  schema.methods.setStatus = async function (status, user) {
    if (![null, 'accept', 'reject', 'cancel'].includes(status)) throw 'такого статуса нет';
    if (['reject', 'cancel'].includes(this.status)) throw 'статус нельзя поменять';
    if (user) {
      if (String(this.toUserId) === String(user._id)) {
        if (!['accept', 'reject'].includes(status)) throw 'У вас нет прав установить этот статус';
      } else if (String(this.fromUserId) === String(user._id)) {
        if (!['cancel'].includes(status)) throw 'У вас нет прав установить этот статус';
      } else {
        throw '!ACL у пользователя нет прав менять статус';
      }
    }
    if (this.status) {
      if (!(this.status === 'accept' && status === 'cancel')) {
        throw 'статус нельзя поменять';
      }
    }
    this.status = status;
    if (this.status === 'accept') {
      const { ChatModel } = app.models;
      const chat = await ChatModel.findOrCreateByUserIds({
        toUserId: this.toUserId,
        fromUserId: this.fromUserId,
      }, {
        ownerType: 'request',
        ownerId: this._id,
      });
      if (!chat) throw '!chat';
      this.chatId = chat._id;
    }
    this.statusedAt = new Date();

    return this.save();
  };

  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'createdAt',
    'fromUserId',
    'toUserId',
    'status',
    'language',
    'help',
    'chatId',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
    'opponentId',
    'opponent',
    'chat',
  ];


  schema.methods.getOpponentId = function (myUserId) {
    if (String(this.toUserId) !== String(myUserId)) {
      return this.toUserId;
    }
    return this.fromUserId;
  };
  schema.methods.getOpponent = async function (params = {}) {
    const myUserId = params.req.user._id;
    const { UserModel } = app.models;
    const opponentId = this.getOpponentId(myUserId);
    const res = {};
    res.opponentId = opponentId;
    if (opponentId) {
      const opponent = await UserModel.findById(opponentId).select(UserModel.views[params.view || 'default']);
      res.opponent = await UserModel.prepare(opponent, params);
    } else {
      res.opponent = null;
    }
    return res;
  };

  
  schema.statics.prepareOne = async function (obj, params) {
    const { req, view = 'default' } = params;
    const userId = req && req.user && req.user._id;

    const select = [
      ...(schema.statics.views[view] || []),
      ...(req && req.data && req.data.select || []),
    ];

    const res = pick(obj.toObject(), schema.statics.views[view]);

    if (userId && select.includes('opponent')) {
      const { opponentId, opponent } = await obj.getOpponent(params);
      res.opponentId = opponentId;
      res.opponent = opponent;
    }
    if (select.includes('chat')) {
      const { ChatModel } = app.models;
      const { chatId } = obj;
      if (chatId) {
        const chat = await ChatModel.findById(chatId).select(ChatModel.views.tiny);
        res.chat = await ChatModel.prepare(chat, { req, view: 'default' });
      }
    }
    return res;
  };
  // schema.methods.toJSON = function() {
  //   const request = this.toObject()
  //   request.id = request._id
  //   if (request.place && request.place.address) {
  //     request.address = request.place.address
  //   } else {
  //     request.address = ''
  //   }
  //   request.created = request.createdAt
  //   request.lastMessage = ''
  //   request.isOnline = true
  //   delete request._id
  //   delete request.__v
  //   return request
  //   // return _.omit(this.toObject(), ['password'])
  // }
  // schema.methods.toJSON = function() {
  //   const request = this.toObject()
  //   request.id = request._id
  //   if (request.place && request.place.address) {
  //     request.address = request.place.address
  //   } else {
  //     request.address = ''
  //   }
  //   request.created = request.createdAt
  //   request.lastMessage = ''
  //   request.isOnline = true
  //   delete request._id
  //   delete request.__v
  //   return request
  //   // return _.omit(this.toObject(), ['password'])
  // }
  //
  // schema.methods.isParticipant = function(profileId) {
  //   let result = false
  //   if (this.from == profileId) {
  //     result = true
  //   }
  //   if (this.to == profileId) {
  //     result = true
  //   }
  //   return result
  // }
  //
  // schema.methods.toJsonForFuture = function(profileId) {
  //   const request = this.toJSON()
  //   if (request.from && request.from._id && request.from._id.toString() != profileId) {
  //     request.title = request.from.name
  //     if (request.from.avatar[0] === '/') {
  //       request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
  //     } else {
  //       request.coverImage = request.from.avatar
  //     }
  //     request.language = request.from.nativeLanguage
  //   } else {
  //     request.title = request.to.name
  //     if (request.to.avatar[0] === '/') {
  //       request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.to.avatar}`
  //     } else {
  //       request.coverImage = request.to.avatar
  //     }
  //     request.language = request.to.nativeLanguage
  //   }
  //   if (request.place && request.place.address) {
  //     request.place = request.place.address
  //   } else {
  //     request.place = ''
  //   }
  //
  //   request.description = 'Личная встреча'
  //
  //   request.isOnline = true
  //   request.owner = this.from._id
  //   return request
  // }
  // schema.methods.toJsonForAllFutures = function(profileId) {
  //   const request = this.toJSON()
  //   if (request.from && request.from._id && request.from._id.toString() != profileId) {
  //     request.title = request.from.name
  //     request.accountType = request.from.accountType;
  //     if (request.from.avatar[0] === '/') {
  //       request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
  //     } else {
  //       request.coverImage = request.from.avatar
  //     }
  //     request.isOnline = request.from.isOnline || false
  //     request.language = request.from.nativeLanguage
  //   } else {
  //     request.accountType = request.to.accountType;
  //     request.title = request.to.name
  //     if (request.to.avatar[0] === '/') {
  //       request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.to.avatar}`
  //     } else {
  //       request.coverImage = request.to.avatar
  //     }
  //     request.isOnline = request.to.isOnline || false
  //     request.language = request.to.nativeLanguage
  //   }
  //   return request
  // }
  //
  // schema.methods.toJsonForProfile = function(profileId) {
  //   const request = this.toJSON()
  //   if (request.from && request.from._id && request.from._id !== profileId) {
  //     request.firstName = request.from.firstName
  //     request.lastName = request.from.lastName
  //     request.avatar = request.from.avatar
  //     request.profile = request.from._id
  //     request.language = request.from.nativeLanguage
  //     if (request.from && request.from.avatar) {
  //       if (request.from.avatar[0] === '/') {
  //         request.avatar = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
  //       } else {
  //         request.avatar = request.from.avatar
  //       }
  //     }
  //   } else {
  //     request.firstName = request.to.firstName
  //     request.lastName = request.to.lastName
  //     request.avatar = request.to.avatar
  //     request.profile = request.to._id
  //     request.language = request.to.nativeLanguage
  //     if (request.from && request.from.avatar) {
  //       if (request.from.avatar[0] === '/') {
  //         request.avatar = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
  //       } else {
  //         request.avatar = request.from.avatar
  //       }
  //     }
  //   }
  //   // delete request.place
  //   return request
  // }
  //
  // schema.methods._confirm = async function() {
  //   this.status = 'ACCEPTED'
  // }
  //
  // schema.methods._reject = async function() {
  //   this.status = 'REJECTED'
  // }
  // schema.methods.getTimezone = async function() {
  //   return ctx.services.GoogleMaps.getTimezone(this.startDate)
  // }
  // schema.methods.getLocalTime = async function() {
  //   const timezone = await this.getTimezone()
  //   return ctx.services.GoogleMaps.getDateByTimezone(this.startDate, timezone)
  // }
  // // // Отклонить приглашение
  // // schema.methods.reject = async function () {
  // //   return 123
  // // }
  // // СТАТИКА
  // schema.statics.checkNotFound = async function(requestId) {
  //   if (!requestId) {
  //     throw e404('requestId is not found')
  //   }
  //   const request = await this.findById(requestId)
  //   if (!request) {
  //     throw e404(`request with id = ${requestId} is not found`)
  //   }
  //   return request
  // }
  // // // СОЗДАТЬ ВСТРЕЧУ
  // schema.statics.add = async function(params) {
  //   const { Request } = ctx.models
  //   if (!params) {
  //     throw e404('request params is not found')
  //   }
  //   const requestFields = ['from', 'to', 'place', 'help', 'startDate']
  //
  //   for (const field of requestFields) {
  //     if (params[field] !== false && !params[field]) {
  //       throw e404(`${field} is not found`)
  //     }
  //   }
  //   if (params.to === params.from) {
  //     throw e404('You can not send themselves')
  //   }
  //   return new Request(params).save()
  // }
  //
  // schema.statics.getList = async function(profileId) {
  //   const {Profile} = ctx.models
  //   const profile = await Profile.check(profileId)
  //
  //   const requests = await this.find({
  //     $or: [
  //       {
  //         to: profile._id
  //       }, {
  //         from: profile._id
  //       }
  //     ]
  //   })
  //   return requests
  // }
  //
  // schema.statics.getProfileFavorites = async function(profileId) {
  //   const {Profile} = ctx.models
  //   await Profile.check(profileId)
  //
  //   const requests = await this.find({
  //     $or: [
  //       {
  //         to: profileId
  //       }, {
  //         from: profileId
  //       }
  //     ]
  //   }).populate('from').populate('to')
  //
  //   const favorites = []
  //   for (const request of requests) {
  //     if (request.from._id != profileId) {
  //       favorites.push(request.from)
  //     }
  //     if (request.to._id != profileId) {
  //       favorites.push(request.to)
  //     }
  //   }
  //   return favorites
  // }
  //
  // schema.pre('save', function (next) {
  //   if (typeof this.place === 'string') {
  //     placesApi.get(this.place)
  //       .then(_place => {
  //         if (_place) {
  //           this.place = _place
  //         }
  //         return next()
  //       })
  //   } else {
  //     return next()
  //   }
  // })

  return schema;
}
export default getSchema;
