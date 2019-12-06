import get from 'lodash/get';
import jwt from 'jsonwebtoken';
import MongooseSchema from '@lskjs/db/MongooseSchema';
import bcrypt from 'bcryptjs';
import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';
import omit from 'lodash/omit';
import set from 'lodash/set';
import pick from 'lodash/pick';
import find from 'lodash/find';
import random from 'lodash/random';
import Promise from 'bluebird';
import getFileWithoutExtension from '@lskjs/utils/getFileWithoutExtension';
import getFileExtension from '@lskjs/utils/getFileExtension';
import distance from './distance';

function getAge(date) {
  if (!date || !date.getTime) return null;
  const ageDifMs = Date.now() - date.getTime();
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

const SALT_WORK_FACTOR = 10;
async function hashPassword(password) {
  const salt = await bcryptGenSalt(SALT_WORK_FACTOR);
  return bcryptHash(password, salt);
}


export function getSchema(app, module) {
  const { db } = app;
  const schema = new MongooseSchema({
    _type: {
      type: String,
    },
    email: {
      // index: true,
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      // index: true,
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: 'String',
      default: null,
    },

    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // nativeLanguage: {
    //   required: true,
    //   type: String,
    //   default: 'ru',
    //   index: true,
    // },
    nativeLanguages: [{
      required: true,
      type: String,
    }],
    learningLanguages: [{
      required: true,
      type: String,
    }],
    // learningLanguages: {
    //   type: [
    //     {
    //       type: String,
    //       index: true,
    //     },
    //   ],
    //   // default: ['en'],
    // },
    bdate: {
      type: Date,
      index: true,
    },
    gender: {
      type: String,
    },
    avatar: {
      type: String,
    },
    // avatars: {},
    city: {
      type: String,
      trim: true,
    },
    _city: {
      type: Object,
    },
    // loc: {},
    loc: {
      type: [Number],
      index: '2dsphere',
      // default: [0, 0],
    },
    // futureEvents: {
    //   type: [
    //     {
    //       type: String,
    //     },
    //   ],
    // },
    // askHelp: {
    //   type: String,
    //   default: null,
    // },
    // offerHelp: {
    //   type: String,
    //   default: null,
    // },
    chatAvailable: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      trim: true,
    },
    // lastMessageObject: {
    //   type: Object,
    //   default: null,
    // },
    // newMessage: {
    //   type: Number,
    //   default: 0,
    // },
    devices: [
      {
        id: String,
        type: {
          type: String,
        },
        token: String,
      },
    ],
    accountType: {
      type: String,
      enum: [
        'BASIC',
        'ISIC',
        'PREMIUM',
      ],
      default: 'BASIC',
    },
    _accountType: {
      type: String,
      enum: [
        null,
        'BASIC',
        'ISIC',
        'PREMIUM',
      ],
      default: null,
    },
    status: {
      type: String,
      enum: [
        null,
        'private',
        'public',
      ],
      default: null,
    },
    type: {
      type: String,
      enum: [
        null,
        'couchsurfer',
        'tutor',
        'traveller',
        'expat',
        'exchange student',
      ],
      default: null,
    },
    photos: [
      // {
      //   type: String,
      //   // ref: 'Image', //app.models.getName()
      // },
      {
        type: db.Schema.Types.ObjectId,
        ref: 'Image', // app.models.getName()
      },
    ],
    premiumExpiredAt: {
      type: Date,
      default: null,
    },

    // options: new MongooseSchema({
    options: {
      type: Object,
      default: {
        showAvatarOnMap: true,
        showAge: true,
        newMessagesPush: true,
        addEditEventsPush: true,
        newParticipantsInEventsPush: true,
        newRequestsPush: true,
        newMessagesEmail: true,
        newRequestsEmail: true,
        addEditEventsEmail: true,
        appNewsEmail: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    editedAt: {
      type: Date,
    },
    signinAt: {
      type: Date,
    },
    visitedAt: {
      type: Date,
    },
    options2: ({
      // показывать аватар на карте +
      showAvatarOnMap: {
        type: Boolean,
        default: true,
      },
      // PUSH уведомления
      // Новые сообщения +
      newMessagesPush: {
        type: Boolean,
        default: true,
      },
      // Добавление/изменение групповых встреч
      addEditEventsPush: {
        type: Boolean,
        default: true,
      },
      // Новые участники групповых встреч
      newParticipantsInEventsPush: {
        type: Boolean,
        default: true,
      },
      // Запросы на личные встречи
      newRequestsPush: {
        type: Boolean,
        default: true,
      },
      // EMAIL уведомления
      // Новые сообщения
      newMessagesEmail: {
        type: Boolean,
        default: true,
      },
      // Запросы на личные встречи
      newRequestsEmail: {
        type: Boolean,
        default: true,
      },
      // Добавление/изменение групповых встреч
      addEditEventsEmail: {
        type: Boolean,
        default: true,
      },
      // Новости приложения
      appNewsEmail: {
        type: Boolean,
        default: true,
      },
    }),
  }, {
    model: 'User',
    collection: 'user',
  });

  schema.methods.getStatus = async function (params = {}) {
    const profile = {
      hasName: !!this.name,
      hasBdate: !!this.bdate,
      hasGender: !!this.gender,
      hasLanguages: !!this.nativeLanguages && !!this.learningLanguages,
      hasAvatar: !!this.photos && !!this.photos[0],
    };
    const { PermitModel, PassportModel } = app.models;

    const facebookPassport = await PassportModel.findOne({ provider: 'facebook', userId: this._id });

    const hasFacebook = !!facebookPassport;
    const hasProfile = every(profile);
    const hasPhone = !!this.phone;

    const hasEmailConfirm = !!this.email;
    const emailPermit = hasEmailConfirm || await PermitModel.findOne({ 'info.provider': 'email', userId: this._id });
    const hasEmail = !!emailPermit;


    return {
      ...profile,
      hasFacebook,

      hasPhone,
      hasPhoneConfirm: hasPhone,
      hasEmail,
      hasEmailConfirm,

      hasProfile,

      hasIcicCard: true,

      allowCabinet: (hasFacebook || hasEmail || hasPhone) && hasProfile,
    };
  };


  schema.methods.getIdentity = function (params = {}) {
    const object = pick(this.toObject(), ['_id', 'username', 'name', 'avatar', 'role']);
    return Object.assign(object, params);
  };
  schema.methods.generateAuthToken = function (params) {
    return jwt.sign(this.getIdentity(params), app.config.jwt.secret);
  };
  schema.methods.verifyPassword = function (password) {
    return bcryptCompare(password, this.password);
  };
  schema.methods.recountRating = async function () {
    const onlineAgo = Math.floor(this.onlineAgo() / 60 / 1000);
    const { RequestModel } = app.models;
    const requestsCount = await RequestModel.count({
      $or: [
        { toUserId: this._id },
        { fromUserId: this._id },
      ],
      status: 'accept',
      // statusedAt: { $gte: new Date() - 30 * 24 * 60 * 60 * 1000 },
    });
    const lastRequest = await RequestModel.findOne({
      $or: [
        { toUserId: this._id },
        { fromUserId: this._id },
      ],
      status: { $in: ['reject', 'accept'] },
      // statusedAt: { $gte: new Date() - 30 * 24 * 60 * 60 * 1000 },
    }).sort({ createdAt: -1 }).select('status');

    const groupsCount = 0;

    const rating = (
      (1 / (Math.max(onlineAgo, 1) * 0.5)) * 100 // 0 - 100
      + (lastRequest.status === 'accept' ? 1 : 0) * 10
      + requestsCount * 5
      + groupsCount * 5
    );

    this.rating = rating;
    // console.log('User.methods.postSave', this.wasNew);
    return this;
  };
  schema.methods.recount = async function () {
    await this.recountRating();
    this.status = this.name && this.nativeLanguages && this.nativeLanguages[0] && this.loc ? 'public' : 'private';
  };

  const { e400, e500 } = app.errors;

  schema.methods.setPassword = async function (password) {
    this.password = await hashPassword(password);
  };
  schema.methods.preSave = async function () {
    // console.log('User.methods.preSave', this.isNew, this.wasNew);
    this.wasNew = this.wasNew || this.isNew;
    // if (this.isModified('password')) {
    //   this.password = await hashPassword(this.password);
    // }
    // if (this.isModified('profile')) {
    //   this.name = fullName(this.profile) || sample.fullName;
    // }
  };
  schema.pre('save', async function (next) {
    // console.log('schema.pre(save', this.isNew);
    await this.preSave();
    next();
  });

  schema.methods.onlineAgo = async function () {
    return this.visitedAt ? new Date() - new Date(this.visitedAt) : 0;
  };
  schema.methods.postSave = async function () {
    // console.log('User.methods.postSave', this.wasNew);
  };
  schema.post('save', async function () {
    // console.log('schema.post(save', this.wasNew);
    await this.postSave();
    // next();
  });

  schema.statics.findAndApproveEmail = async function (token) {
    const { checkNotFound } = app.helpers;
    const decode = jwt.verify(token, app.config.jwt.secret);
    const { email, userId } = decode;
    if (!decode) throw e500('jsonwebtoken error');
    if (!decode.userId) throw e400('!decode.userId');
    if (!decode.email) throw e400('!decode.email');
    const user = await this
      .findById(userId)
      .then(checkNotFound);
    if (user.email !== email) throw e400('user.email !== email');
    if (!user.private) user.private = {};
    // console.log(user.private.approvedEmailToken);
    // console.log('=================================');
    // console.log(token);
    if (user.private.approvedEmailToken !== token) throw e400('wrong token');
    user.private.approvedEmailDate = new Date();
    user.meta.approvedEmail = true;
    user.private.approvedEmailToken = null;
    user.markModified('private');
    user.markModified('meta');
    // console.log(user);
    return user.save();
  };

  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'name',
    'avatar',
    'nativeLanguages',
    'accountType',
    'online',
    'photos',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
    'loc', // because distance
    'age',
    'distance',
    'description',
    'bdate',
    'gender',
    'learningLanguages',
    'photos',
    'city',
  ];
  schema.statics.views.extended = [
    ...schema.statics.views.default,
    'loc',
    'options',
    'isics',
    'email',
    'phone',
    'deleted',
    'blocked',
    'premiumExpiredAt',
    'passports',
  ];


  schema.statics.prepareOne = async function (obj, params = {}) {
    if (!obj) return null;
    const { req } = params;
    const select = this.getSelect(params);
    const { loc, _id } = obj;

    const userId = req && req.user && req.user._id;
    const isMe = userId && String(userId) === String(obj._id);
    // const isMe = true;

    const res = pick(obj.toObject(), select);

    if (select.includes('online')) {
      res.online = Math.random() < 0.5;
    }

    if (select.includes('age')) {
      res.age = getAge(res.bdate);
    }

    if (res.bdate) {
      res.bdate = (new Date(res.bdate)).toISOString().split('T')[0]; // eslint-disable-line prefer-destructuring
    }

    if (res.photos) {
      res.photos = await obj.getPhotos();
    }

    if (res.bdate && obj.bdate) {
      res.bdate = (new Date(obj.bdate)).toISOString().substr(0, 10);
    }

    if (userId && select.includes('distance')) {
      if (!loc) {
        res.distance = null;
      } else if (isMe) {
        res.distance = 0;
      } else {
        const { UserModel } = app.models;
        // const UserModel = this.constructor;
        const user = await UserModel.findById(userId).select(['loc']);
        res.distance = distance(loc, user.loc);
      }
    }
    // }


    // !res.avatar &&

    if (res.photos && res.photos[0]) {
      res.avatar = res.photos[0].small;
    } else {
      res.avatar = app.url('/static/default-avatar.png');
    }

    // if (view === 'profile') {
    //   select.push('isics');
    //   select.push('options');
    // }
    // if ()
    // console.log({ userId, select }, select.includes('request'));

    if (userId && select.includes('request')) {
      const { RequestModel } = app.models;
      const userId = req.user && req.user._id;
      const request = await RequestModel.findOne({
        status: { $in: [null, 'accept'] },
        $or: [
          {
            fromUserId: _id,
            toUserId: userId,
          },
          {
            toUserId: _id,
            fromUserId: userId,
          },
        ],
      }).sort({ createdAt: -1 });
      if (request) {
        res.request = await RequestModel.prepare(request, { req: params.req, view: 'tiny' });
      } else {
        res.request = null;
      }
    }

    if (isMe && select.includes('isics')) {
      const { IsicCardModel } = app.models;
      const isics = await obj.getIsicCards({}, ['*']);
      res.isics = await IsicCardModel.prepare(isics, { req });
    }
    if (isMe && select.includes('passports')) {
      const { PassportModel } = app.models;
      const passports = await PassportModel.find({ userId: _id });
      res.passports = await Promise.map(passports, async (passport) => {
        await app.modules.auth.updatePassportData(passport).catch((err) => {
          console.error('updatePassportData', err);
        });
        return pick(await PassportModel.prepare(passport, { req }), ['_id', 'provider', 'providerId', 'userId', 'profile', 'createdAt', 'updatedAt']);
      });
    }

    if (isMe && select.includes('options')) {
      //
    } else {
      delete res.options;
    }
    return res;
  };


  // schema.methods.getImageSizes = async function (avatar, updatedAt = Date.now()) {
  //   const url = __DEV__ ? 'https://hijay.mgbeta.ru' : app.config.url;
  //   const avatars = {};
  //   if (avatar && avatar[0] !== '/') {
  //     avatars.original = avatar;
  //   }
  //   if (avatar && avatar[0] === '/') {
  //     const path = getFileWithoutExtension(avatar);
  //     const ext = getFileExtension(avatar);
  //     const ts = avatar.indexOf('?') >= 0 ? avatar.split('?')[1] : new Date(updatedAt).getTime();
  //     avatars.small = `${url}${path}_s.${ext}?${ts}`;
  //     avatars.medium = `${url}${path}_m.${ext}?${ts}`;
  //     avatars.original = `${url}${path}_b.${ext}?${ts}`;
  //   }
  //   return avatars;
  // };


  schema.methods.getPhotos = async function () {
    const { ImageModel } = app.models;
    let photos = await ImageModel.find({
      _id: {
        $in: this.photos,
      },
    }).select(['createdAt', 'info', 'path']);

    photos = photos.map(photo => ({
      ...photo.getUrls(),
      _id: photo._id,
    }));

    // console.log({photos});

    return this.photos.map(_id => find(photos, { _id })).filter(photo => !!photo);
  };


  schema.methods.getIsicCards = async function (params = {}, options = {}) {
    const { IsicCardModel } = app.models;
    let res = IsicCardModel.find({
      active: true,
      userId: this._id,
      ...params,
    });
    if (options.select) {
      res = res.select(options.select);
    }
    return res;
  };

  schema.methods.getPurchases = async function (params = {}) {
    const { PurchaseModel } = app.models;
    return PurchaseModel.find({
      userId: this._id,
      ...params,
    });
  };

  schema.methods.calculateAccountType = async function () {
    if (this._accountType) { // для ручной фиксации accountType
      return this._accountType;
    }
    let accountType = 'BASIC';
    const { isics, purchases } = await Promise.props({
      isics: this.getIsicCards(),
      purchases: this.getPurchases({
        isSubscription: true,
        isActive: true,
      }),
    });
    if (isics.length > 0) {
      accountType = 'ISIC';
    }
    if (purchases.length > 0) {
      accountType = 'PREMIUM';
    }

    return accountType;
  };
  schema.methods.updateAccountType = async function () {
    const accountType = await this.calculateAccountType();
    if (this.accountType === 'PREMIUM' && accountType !== 'PREMIUM') {
      set(this, 'options.showAvatarOnMap', true);
      set(this, 'options.showAge', true);
    }
    this.accountType = accountType;
    return this;
  };

  // schema.methods.updateAccountType = async function () {
  //   const { ImageModel } = app.models;
  //   let photos = await ImageModel.find({
  //     _id: {
  //       $in: this.photos,
  //     },
  //   }).select(['createdAt', 'info', 'path']);

  //   photos = photos.map(photo => ({
  //     ...photo.getUrls(),
  //     _id: photo._id,
  //   }));

  //   // console.log({photos});

  //   return this.photos.map(_id => find(photos, { _id })).filter(photo => !!photo);
  // };


  return schema;
}

export default getSchema;
//
//
// export default (app, module) => {
//   const schema = getSchema(app, module);
//   return app.db.model('User', schema.getMongooseSchema(), 'user');
// };
