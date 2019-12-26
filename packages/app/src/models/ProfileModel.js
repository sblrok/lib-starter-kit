import MongooseSchema from '@lskjs/db/MongooseSchema';
import jwt from 'jsonwebtoken';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import merge from 'lodash/merge';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import omit from 'lodash/omit';
import get from 'lodash/get';
import pick from 'lodash/pick';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import Promise from 'bluebird';
import validator from 'validator';
// import sharp from 'sharp';
import fs from 'fs';
import Schedule from 'node-schedule';
import moment from 'moment';

import getNotify from './notify';

const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

function toRad(Value) {
  return Value * Math.PI / 180;
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  // eslint-disable-next-line no-param-reassign
  lat1 = toRad(lat1);
  // eslint-disable-next-line no-param-reassign
  lat2 = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function onlyId(data) {
  const object = {};
  if (typeof (data) === 'object') {
    const keys = Object.keys(data);
    keys.forEach((key) => {
      if (typeof (data[key]) === 'object') {
        object[key] = pick(data[key], ['id', '_id']);
        if (object[key].id) {
          object[key].id = object[key].id.toString();
        }
        if (object[key]._id) {
          object[key]._id = object[key]._id.toString();
        }
      } else {
        object[key] = data[key];
      }
    });
  }
  return object;
}

export default function ProfileModel(app) {
  const { db } = app;

  const transporter = (app.config.mail && app.config.mail.transport)
    && Promise.promisifyAll(nodemailer.createTransport(app.config.mail.transport));

  const schema = new MongooseSchema({
    firstName: {
      type: String,
      default: 'Имя',
      trim: true,
    },
    lastName: {
      type: String,
      default: 'Фамилия',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      // index: true,
      type: String,
      trim: true,
      lowercase: true,
      unique: false,
      default: null,
      validate: (email) => {
        if (email === null) return true;
        return validator.isEmail(email);
      },
    },
    nativeLanguage: {
      required: true,
      type: String,
      default: 'ru',
      // index: true,
    },
    learningLanguages: {
      type: [
        {
          type: String,
          // index: true,
        },
      ],
      default: ['en'],
    },
    bdate: {
      // index: true,
      required: true,
      type: Date,
      default: Date.now(),
    },
    avatar: {
      type: String,
      default: '/static/default-avatar.png',
    },
    // avatars: {},
    city: {
      type: String,
      default: 'Город',
      trim: true,
    },
    _city: {
      type: Object,
    },
    loc: {
      type: [Number],
      // index: '2dsphere',
      default: [0, 0],
    },
    futureEvents: {
      type: [
        {
          type: String,
        },
      ],
    },
    askHelp: {
      type: String,
      default: null,
    },
    offerHelp: {
      type: String,
      default: null,
    },
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
    linkToSocialNetwork: {
      type: String,
      toLowerCase: true,
    },
    socialNetworkType: {
      type: String,
      enum: ['vk', 'fb', 'local'],
      toLowerCase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    lastMessageObject: {
      type: Object,
      default: null,
    },
    _lastVisitedAt: {
      type: Date,
      default: null,
    },
    password: {
      type: 'String',
      default: null,
    },
    newMessage: {
      type: Number,
      default: 0,
    },
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
      //   // ref: 'Image', //ctx.models.getName()
      // },
      {
        type: db.Schema.Types.ObjectId,
        ref: 'Image', // ctx.models.getName()
      },
    ],
    premiumExpiredAt: {
      type: Date,
      default: null,
    },
  }, {
    model: 'Profile',
    collection: 'profile',
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });
  // МЕТОДЫ
  // КООРДИНАТЫ
  const notify = getNotify(app);
  const SALT_WORK_FACTOR = 10;

  const preValidate = function (next) {
    const { isBase64 } = app.helpers;
    const promises = [];
    if (this.isModified('email')) {
      if (!validator.isEmail(this.email)) {
        this.email = null;
      }
    }
    if (this.isModified('learningLanguages') && typeof this.learningLanguages === 'string') {
      try {
        this.learningLanguages = this.learningLanguages
          .split(',')
          .filter(language => language && language.trim)
          .map(language => language.trim());
      } catch (err) {
        console.error('learningLanguages');
      }
    }
    if (this.isModified('photos')) {
      console.log(111);
      const promise = async () => this.savePhotos();
      promises.push(promise());
    } else if (this.isModified('avatar') && isBase64(this.avatar)) {
      const promise = async () => this.saveAvatar();
      promises.push(promise());
    }
    if (this.isModified('blocked') && this.blocked === true) {
      const promise = async () => this.blockProfile();
      promises.push(promise());
    }
    if (this.isModified('blocked') && this.blocked === false) {
      const promise = async () => this.unblockProfile();
      promises.push(promise());
    }
    return Promise.all(promises).then(next);
  };
  const preSave = function (next) {
    const promises = [];
    if (this.isModified('password')) {
      const promise = () => this.encryptPassword(this.password).then((password) => {
        this.password = password;
        return this;
      });
      promises.push(promise());
    }
    if (this.isModified('deleted') && this.deleted === true) {
      const promise = () => {
        const { Passport } = ctx.models;
        return Promise.all([
          this.hideAllMessages(),
          Passport.remove({
            profileId: this._id,
          }),
        ]);
      };
      promises.push(promise());
    }
    if (this.isNew) {
      const { Options } = ctx.models;
      const promise = () => Options.createDefault(this.id);
      promises.push(promise());
      if (this.socialNetworkType !== 'local' && this.email) {
        const password = this.constructor.generatePassword();
        this.password = password;
      }
      promises.push(promise());
    }
    Promise.all(promises)
      .then(next);
  };

  schema.pre('save', preSave);
  schema.pre('update', preSave);
  schema.pre('validate', preValidate);

  schema.virtual('lastMessage').get(function () {
    if (this.lastMessageObject && this.lastMessageObject.text) {
      return this.lastMessageObject.text;
    }
    return null;
  });
  schema.virtual('lat').get(function () {
    return get(this, 'loc[1]', 0);
  });
  schema.virtual('lng').get(function () {
    return get(this, 'loc[0]', 0);
  });
  schema.virtual('name').get(function () {
    let name = '';
    if (this.firstName) name += this.firstName;
    if (this.lastName) {
      if (name.length > 0) name += ' ';
      name += this.lastName;
    }
    return name;
  });
  schema.virtual('isOnline').get(function () {
    return ctx.onlineMap.isOnline(this._id);
  });
  schema.virtual('lastVisitedAt').get(function () {
    const lastVisited = ctx.onlineMap.getLastVisited(this._id);
    if (lastVisited) {
      return lastVisited;
    }
    if (this._lastVisitedAt) {
      return this._lastVisitedAt;
    }
    return null;
  });
  schema.virtual('avatars').get(function () {
    const { url } = ctx.config;
    const avatars = {};
    const { avatar } = this || '/static/default-avatar.png';
    if (avatar && avatar[0] !== '/') {
      avatars.original = avatar;
    }
    if (avatar && avatar[0] === '/') {
      const path = ctx.helpers.getFilePathWithoutExtension(avatar);
      const ext = ctx.helpers.getFileExtensionFromPath(avatar);
      const ts = avatar.indexOf('?') >= 0 ? avatar.split('?')[1] : new Date(this.updatedAt).getTime();
      avatars.small = `${url}${path}_s.${ext}?${ts}`;
      avatars.medium = `${url}${path}_m.${ext}?${ts}`;
      avatars.original = `${url}${path}_b.${ext}?${ts}`;
    }
    return avatars;
  });

  schema.methods.toJSON = function () {
    const profile = this.toObject();
    profile.id = profile._id;
    profile.language = profile.nativeLanguage;
    const { url } = app.config;
    if (profile.avatar && profile.avatar[0] === '/') {
      profile.avatar = `${url}${profile.avatar}`;
    }
    return omit(profile, [
      '_id',
      '__v',
      'devices',
      '_lastVisitedAt',
      'password',
      'passports',
      'photos',
      'lastMessageObject',
      'pubnub',
      'updatedAt',
      'createdAt',
      'linkToSocialNetwork',
      'socialNetworkType',
      'loc',
      '_city',
    ]);
  };

  schema.statics.getBlockProfileKey = id => `profile_blocked_${id}`;

  schema.methods.blockProfile = async function () {
    const { PassportModel } = app.models;
    const passports = await PassportModel.find({
      profileId: this._id,
    });
    const promises = passports.map((passport) => {
      // eslint-disable-next-line no-param-reassign
      passport.blocked = true;
      // eslint-disable-next-line no-param-reassign
      passport.lastProfileId = this._id;
      return passport.save();
    });
    await this.hideAllMessages();
    await Promise.all(promises);
    ctx.services.RedisService.set(this.constructor.getBlockProfileKey(this.id), true);
    return {
      status: 'success',
    };
  };

  schema.methods.hideAllMessages = async function () {
    const { MessageSocketModel } = app.models;
    const messages = await MessageSocketModel.find({
      from: this._id,
      status: 'UNREAD',
    });
    const promises = messages.map((message) => {
      // eslint-disable-next-line no-param-reassign
      message.status = 'READ';
      return message.save();
    });
    return Promise.all(promises);
  };

  schema.methods.unblockProfile = async function () {
    const { Passport } = app.models;
    const passports = await Passport.find({
      profileId: this._id,
    });
    const promises = passports.map((passport) => {
      // eslint-disable-next-line no-param-reassign
      passport.blocked = false;
      return passport.save();
    });
    await Promise.all(promises);
    ctx.services.RedisService.set(this.constructor.getBlockProfileKey(this.id), false);
    return {
      status: 'success',
    };
  };

  schema.methods.bindIsicCardsByIds = async function (ids = []) {
    const { IsicCardModel } = app.models;
    if (ids.length > 0) {
      const isicCards = await IsicCardModel.find({
        _id: {
          $in: ids,
        },
        profileId: null,
        expDate: {
          $gte: moment(new Date()).seconds(10).toDate(),
        },
      });
      const promises = isicCards.map((isicCard) => {
        // eslint-disable-next-line no-param-reassign
        isicCard.profileId = this._id;
        // eslint-disable-next-line no-param-reassign
        isicCard.lastProfileId = this._id;
        return isicCard.save();
      });
      await Promise.all(promises);
    }
    await this.updateAccountType();
    return null;
  };

  schema.methods.getPhotos = async function () {
    const { ImageModel } = app.models;
    let photos = await ImageModel.find({
      _id: {
        $in: this.photos,
      },
    })
      .select(['info', 'path']);
    photos = photos.map(photo => ({
      ...photo.urls,
      id: photo._id,
    }));
    return this.photos.map(id => find(photos, { id })).filter(photo => !!photo);
  };

  schema.methods.pick = function (fields) {
    const profile = this.toJSON();
    if (Array.isArray(fields)) {
      return pick(profile, fields);
    }
    return profile;
  };
  // Взять конкретную настройку
  schema.methods.getOption = async function (name) {
    const { OptionsModel } = app.models;
    const options = await OptionsModel.findOne({
      profile: this.id,
    })
      .select(name);
    if (options) {
      return options[name];
    }
    return undefined;
  };
  //
  schema.methods.sendWelcomeEmail = async function () {
    const mailOptions = {
      subject: "Поздравляем с регистрацией в 'HiJay'",
      text: `Уважаемый ${this.name}, поздравляем с регистрацией в 'HiJay'`,
    };
    return this.sendEmail(mailOptions);
  };
  schema.methods.encryptPassword = async function (password) {
    return bcryptGenSalt(SALT_WORK_FACTOR)
      .then((salt) => {
        return bcryptHash(password, salt);
      });
  };

  schema.statics.createDefaultAvatars = async function () {
    const fullPath = `${__dirname}/../src/public/default-avatar.png`;
    const filePath = `${__dirname}/../src/public/default-avatar`;
    const fileExt = 'jpg';
    const tasks = [];
    tasks.push(() => {
      const _path = `${filePath}_s.${fileExt}`;
      return sharp(fullPath)
        .resize(75)
        .quality(60)
        .progressive()
        .jpeg()
        .toFile(_path);
    });
    tasks.push(() => {
      const _path = `${filePath}_m.${fileExt}`;
      return sharp(fullPath)
        .resize(240)
        .quality(60)
        .progressive()
        .jpeg()
        .toFile(_path);
    });
    tasks.push(() => {
      const _path = `${filePath}_b.${fileExt}`;
      return sharp(fullPath)
        .resize(1024)
        .progressive()
        .quality(80)
        .jpeg()
        .toFile(_path);
    });

    return Promise.all(tasks.map(task => task()));
  };

  schema.methods.saveResizedAvatars = async function (file) {
    try {
      const path = this.avatar.split('?ts')[0];
      const fileExt = ctx.helpers.getFileExtensionFromPath(path);
      const filePath = ctx.helpers.getFilePathWithoutExtension(path);
      const fullPath = `${process.cwd()}/${path}`;
      if (!file) {
        file = fs.readFileSync(fullPath);
      }
      const buffer = new Buffer(file, 'base64');
      const tasks = [];
      tasks.push(() => {
        const _path = `${filePath}_s.${fileExt}`;
        const _fullPath = `${process.cwd()}/${_path}`;
        return sharp(buffer)
          .resize(75)
          .quality(60)
          .progressive()
          .jpeg()
          .toFile(_fullPath);
      });
      tasks.push(() => {
        const _path = `${filePath}_m.${fileExt}`;
        const _fullPath = `${process.cwd()}/${_path}`;
        return sharp(buffer)
          .resize(240)
          .quality(60)
          .progressive()
          .jpeg()
          .toFile(_fullPath);
      });
      tasks.push(() => {
        const _path = `${filePath}_b.${fileExt}`;
        const _fullPath = `${process.cwd()}/${_path}`;
        return sharp(buffer)
          .resize(1024)
          .quality(80)
          .progressive()
          .jpeg()
          .toFile(_fullPath);
      });
      return Promise.all(tasks.map(task => task()));
    } catch (err) {
      return null;
    }
  };

  schema.methods.savePhotos = async function () {
    const { ImageModel } = app.models;
    if (!Array.isArray(this.photos)) return null;
    let photos = this.photos.filter((photoId) => {
      return db.Types.ObjectId.isValid(photoId);
    });
    let images = await ImageModel.find({
      _id: {
        $in: this.photos,
      },
    });
    const _images = [];
    this.photos.forEach((photoId) => {
      const photo = find(images, { id: photoId.toString() });
      if (photo) _images.push(photo);
    });
    images = _images;
    const promises = images.map((image) => {
      // eslint-disable-next-line no-param-reassign
      image.subjectId = this._id;
      // eslint-disable-next-line no-param-reassign
      image.subjectType = 'profile';
      return image.save();
    });
    photos = await Promise.all(promises);
    if (photos && photos[0]) {
      const photo = photos[0];
      this.avatar = `${photo.path}?${photo.info.ts}`;
    } else {
      this.avatar = '/static/default-avatar.png';
    }
    this.photos = photos.map(photo => photo.id);
    return this;
  };
  schema.statics.filter = async function (params = {}, extQuery = {}, profile) {
    try {
      const query = {
        deleted: false,
      };
      if (params.language && params.learningLanguages) {
        // Когда галка есть
        query.$or = [
          {
            nativeLanguage: {
              $in: params.language.split(','),
            },
          },
          {
            learningLanguages: {
              $in: params.learningLanguages.split(','),
            },
          },
        ];
        if (profile && profile.nativeLanguage) {
          query.$or[0].nativeLanguage.$ne = profile.nativeLanguage;
        }
      }
      if (params.language && !params.learningLanguages) {
        // КОгда галки нету
        query.$or = [
          {
            nativeLanguage: {
              $in: params.language.split(','),
            },
          },
        ];
      }
      if (params.anyLanguage) {
        query.$or = [
          {
            nativeLanguage: {
              $in: params.anyLanguage.split(','),
            },
          },
          {
            learningLanguages: {
              $in: params.anyLanguage.split(','),
            },
          },
        ];
      }
      if (params.nativeLanguage) {
        query.nativeLanguage = {
          $in: params.nativeLanguage.split(','),
        };
      }
      if (params.learningLanguages) {
        query.learningLanguages = {
          $in: params.learningLanguages.split(','),
        };
      }
      if (Number(params.foreignersOnly) && profile) {
        if (!query.nativeLanguage) query.nativeLanguage = {};
        query.nativeLanguage.$ne = profile.nativeLanguage;
      }
      if (params.lat !== null && params.lng !== null
        && params.distance) {
        query.loc = {};
        query.loc.$near = {
          $maxDistance: params.distance * 1000,
          $geometry: {
            type: 'Point',
            coordinates: [params.lng, params.lat],
          },
        };
      }
      Object.assign(query, extQuery);
      let Filter = this.find(query);
      if (parseInt(params.limit, 10)) {
        Filter = Filter.limit(parseInt(params.limit, 10));
      }
      if (parseInt(params.offset, 10)) {
        Filter = Filter.skip(parseInt(params.offset, 10));
      }
      if (params.sort) {
        Filter = Filter.sort(params.sort);
      }
      if (params.select) {
        if (Array.isArray(params.select)) {
          Filter = Filter.select(params.select.join(' '));
        } else {
          Filter = Filter.select(params.select);
        }
      }
      return Filter;
    } catch (err) {
      app.log.error(err);
      return [];
    }
  };
  schema.methods.filter = async function (params, extQuery) {
    if (params.distance) {
      // eslint-disable-next-line no-param-reassign
      params.loc = {};
      // eslint-disable-next-line no-param-reassign
      params.loc.$near = {
        $maxDistance: params.distance * 1000,
        $geometry: {
          type: 'Point',
          coordinates: this.loc,
        },
      };
    }
    if (!extQuery) {
      extQuery = {
        _id: {
          $ne: this.id,
        },
      };
    }
    return this.constructor.filter(params, extQuery, this);
  };

  schema.methods.saveAvatar = async function () {
    const title = `profile_${this.id}`;
    const path = await ctx.helpers.saveFile(title, this.avatar);
    const timestamp = `?${new Date().getTime()}`;
    const { Image } = ctx.models;
    const image = new Image({
      subjectId: this.id,
      subjectType: 'profile',
      path,
      info: {},
    });
    await image.save();
    await image.saveResizedImages();
    this.photos = [image.id];
    await this.savePhotos();
    return this;
  };

  schema.methods.getIdentity = function (params) {
    const object = pick(this.toObject(), ['_id', 'email', 'name']);
    if (!params) {
      return object;
    }
    return Object.assign(object, params);
  };
  // schema.methods.getRequests = function (params) {
  //   const { Request } = ctx.models;
  //   return Request.find({
  //     $or: [
  //       {
  //         from: this.id,
  //       },
  //       {
  //         to: this.id,
  //       },
  //     ],
  //   });
  // };
  //
  // schema.methods.isMyJay = async function (profileId) {
  //   const { Request } = ctx.models;
  //   const requests = await Request.find({
  //     $or: [
  //       {
  //         from: profileId,
  //         to: this._id,
  //         status: 'ACCEPTED',
  //       },
  //       {
  //         to: profileId,
  //         from: this._id,
  //         status: 'ACCEPTED',
  //       },
  //     ],
  //   });
  //   if (requests && Array.isArray(requests) && requests.length > 0) {
  //     return true;
  //   }
  //   return false;
  // };
  //
  // schema.methods.findLastMessage = async function (profileId, params = {}) {
  //   const { Message } = ctx.modules.chat.models;
  //   let subjectId;
  //   if (profileId) {
  //     if (this.id < profileId) {
  //       subjectId = { $regex: `${this.id}_${profileId}`, $options: 'i' };
  //     } else {
  //       subjectId = { $regex: `${profileId}_${this.id}`, $options: 'i' };
  //     }
  //   } else {
  //     subjectId = { $regex: this.id, $options: 'i' };
  //   }
  //   let query = Message
  //     .findOne({
  //       subjectType: 'profile',
  //       hidden: {
  //         $nin: [this.id],
  //       },
  //       subjectId,
  //     })
  //     .sort({ createdAt: -1 });
  //   if (params.select) {
  //     query = query.select(params.select);
  //   }
  //   return query;
  // };
  // // Найти и записат последнее сообщение от этого юзера
  // schema.methods.setLastMessageTo = async function (profileId) {
  //   // console.log(`Я ${this.name}`)
  //   const message = await this.findLastMessage(profileId);
  //   // console.log('Последнее сообщение ', { message })
  //   if (message && message.text) {
  //     this.lastMessage = message.text;
  //     this.lastMessageObject = message;
  //   } else {
  //     this.lastMessageObject = null;
  //     this.lastMessage = null;
  //   }
  //   return this;
  // };
  // // Найти и записать последнее сообщение от или к этому юзеру
  // schema.methods.setLastGeneralMessage = async function (profileId) {
  //   this.lastGeneralMessage = await this.findLastMessage();
  //   return this;
  // };
  //
  // schema.methods.sendEmail = function (inputParams) {
  //   try {
  //     if (!transporter) {
  //       throw e500('!transporter');
  //     }
  //     if (!this.email) return null;
  //     let params = inputParams;
  //     if (typeof params === 'string') {
  //       params = {
  //         text: params,
  //       };
  //     }
  //     const options = Object.assign({
  //       to: this.email,
  //     }, ctx.config.mail.options, params);
  //     return transporter.sendMailAsync(options);
  //   } catch (err) {
  //     console.error(err);
  //     return { err };
  //   }
  // };
  //
  schema.methods.notifyEmail = async function (emailType, params) {
    try {
      if (!app.config.email_notifications) return null;
      if (!this.email || !validator.isEmail(this.email)) return null;
      const isAllowNotify = await this.isAllowNotifyEmail(emailType);
      if (!isAllowNotify) return null;
      if (emailType === 'group_meetings' && params.events.length === 0) {
        return null;
      }
      Object.assign(params,
        { _profile: this.toJSON() },
        { language: this.nativeLanguage, type: emailType });

      // eslint-disable-next-line no-param-reassign
      params._profile.token = await this.generateAuthToken();
      return app.modules.mailer.send({
        to: this.email,
        template: emailType,
        params,
      });
    } catch (err) {
      app.log.error(err);
    }
  };
  // // Проверка можно ли отсылать юзеру эти пуши
  schema.methods.isAllowNotify = async function (type) {
    let option = true;
    if (type === 'msg9' || type === 'msg10') {
      option = await this.getOption('newMessagesPush');
      return !!option;
    }
    if (type === 'msg7' || type === 'msg14' || type === 'msg15') {
      option = await this.getOption('AddEditEventsPush');
      return !!option;
    }
    if (type === 'msg8') {
      option = await this.getOption('newParticipantsInEventsPush');
      return !!option;
    }
    if (type === 'msg1' || type === 'msg4') {
      option = await this.getOption('newRequestsPush');
      return !!option;
    }
    return !!option;
  };
  // // Проверка можно ли отсылать юзеру эти сообщения на почту
  schema.methods.isAllowNotifyEmail = async function (type) {
    let option = true;
    if (type === 'message') {
      option = await this.getOption('newMessagesEmail');
      return !!option;
    }
    if (
      type === 'request_meeting_help_me'
      || type === 'request_meeting_help_you'
      || type === 'meeting_confirmited'
      || type === 'meeting_rejected') {
      option = await this.getOption('newRequestsEmail');
      return !!option;
    }
    if (type === 'change_time_group_meeting'
      || type === 'change_place_group_meeting'
      || type === 'change_place_time_group_meeting'
      || type === 'group_meetings') {
      option = await this.getOption('AddEditEventsEmail');
      return !!option;
    }
    return !!option;
  };
  //
  // schema.methods.notify = async function (msgType, params) {
  //   try {
  //     if (!ctx.config.push_notifications) return;
  //     const isAllowNotify = await this.isAllowNotify(msgType);
  //     if (!isAllowNotify) return null;
  //     if (msgType === 'msg9') {
  //       ctx.log.info(`${params.fromProfile.name} отправляет сообщение ${this.name}: ${params.message.text}`);
  //     }
  //     const { PushNotifications } = ctx.services;
  //     if (!PushNotifications.check(this.id, msgType)) return null;
  //     PushNotifications.update(this.id, msgType);
  //     const pushParams = Object.assign({}, params);
  //     const getNotice = await notify.get(msgType);
  //     const notice = await getNotice(params, 'ru');
  //     pushParams.myProfile = this.toJSON();
  //     pushParams.myProfileId = this.id;
  //     pushParams.title = notice;
  //     pushParams.type = msgType;
  //     const notifications = await this.getNotifications();
  //     pushParams.notificationsCount = notifications.all;
  //     return PushNotifications.pushSend(this.devices, onlyId(pushParams));
  //   } catch (err) {
  //     console.error(err);
  //     return err;
  //   }
  // };
  // schema.statics.notify = async function (profileId, msgType, params) {
  //   const profile = await this.findById(profileId);
  //   if (!profile || !profile.notify) {
  //     return null;
  //   }
  //   return profile.notify(msgType, params);
  // };
  // schema.methods.getSocialShares = async function (params = {}) {
  //   let result = await ctx.models.SocialShare.aggregate(
  //     [
  //       {
  //         $match: {
  //           profileId: this._id,
  //           ...params,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$socialNetworkType',
  //           count: { $sum: 1 },
  //         },
  //       },
  //     ]);
  //   result = groupBy(result, '_id');
  //   const socialsShares = {};
  //   forEach(result, (social, key) => {
  //     socialsShares[key] = social[0].count || 0;
  //   });
  //   if (!socialsShares.vk) socialsShares.vk = 0;
  //   if (!socialsShares.fb) socialsShares.fb = 0;
  //   if (!socialsShares.twitter) socialsShares.twitter = 0;
  //   return socialsShares;
  // };
  // schema.methods.testNotify = async function (msgType) {
  //   try {
  //     let params = {};
  //     const { Profile, Event, Request } = ctx.models;
  //     const msgTypes = [];
  //     for (let i = 0; i < 20; i++) {
  //       msgTypes.push(`msg${i + 1}`);
  //     }
  //     if (msgType === 'msg1') {
  //       // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       params = { fromProfile: profile.toJSON(), toProfile: profile.toJSON() };
  //     }
  //     if (msgType === 'msg2') {
  //       // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const toProfile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = {
  //         // fromProfile,
  //         request,
  //         // fromProfileId: fromProfile.id,
  //         requestId: request.id,
  //         toProfile,
  //         toProfileId: toProfile.id,
  //       };
  //     }
  //     if (msgType === 'msg3') {
  //       // ! //
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { profile, request, profileId: profile.id, requestId: request.id };
  //     }
  //     if (msgType === 'msg4') {
  //       // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const fromProfile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { fromProfile, request, requestId: request.id, fromProfileId: fromProfile.id };
  //     }
  //     if (msgType === 'msg5') {
  //       // ! //
  //       // const toProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const toProfile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { toProfile, request, requestId: request.id, toProfileId: toProfile.id };
  //     }
  //     if (msgType === 'msg6') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { profile, request, profileId: profile.id, requestId: request.id };
  //     }
  //     if (msgType === 'msg7') {
  //       const event = await Event.findOne({});
  //       params = { event, eventId: event.id };
  //     }
  //     if (msgType === 'msg8') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       const event = await Event.findOne({});
  //       params = { profile, event, profileId: profile.id, eventId: event.id };
  //     }
  //     if (msgType === 'msg9') {
  //       // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const fromProfile = await Profile.findOne({});
  //       const message = 'Привет!';
  //       params = { fromProfile, message, fromProfileId: fromProfile.id };
  //     }
  //     if (msgType === 'msg10') {
  //       // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
  //       const fromProfile = await Profile.findOne({});
  //       const message = 'Привет!';
  //       params = { fromProfile, message, fromProfileId: fromProfile.id };
  //     }
  //     if (msgType === 'msg11') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { request, profile, profileId: profile.id, requestId: request.id };
  //     }
  //     if (msgType === 'msg12') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       const request = await Request.findOne({});
  //       params = { request, profile, requestId: request.id, profileId: profile.id };
  //     }
  //     if (msgType === 'msg13') {
  //       const event = await Event.findOne({});
  //       params = { event, eventId: event.id };
  //     }
  //     if (msgType === 'msg14') {
  //       const event = await Event.findOne({});
  //       params = { event, eventId: event.id };
  //     }
  //     if (msgType === 'msg15') {
  //       const event = await Event.findOne({});
  //       params = { event, eventId: event.id };
  //     }
  //     if (msgType === 'msg16') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       params = { profile, profileId: profile.id };
  //     }
  //     if (msgType === 'msg17') {
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       params = { profile, profileId: profile.id };
  //     }
  //     if (msgType === 'msg18') {
  //       const text = 'Привет!';
  //       params = { text };
  //     }
  //     if (msgType === 'msg19') {
  //       const event = await Event.findOne({});
  //       params = { event, eventId: event.id };
  //     }
  //     if (msgType === 'msg20') {
  //       const event = await Event.findOne({});
  //       // const profile = await Profile.findById('580aa0299176c70012ef469f')
  //       const profile = await Profile.findOne({});
  //       params = { event, profile, eventId: event.id, profileId: profile.id };
  //     }
  //     if (msgTypes.indexOf(msgType) === -1) {
  //       throw e404('Неверно указан тип сообщения');
  //     }
  //     return this.notify(msgType, params);
  //     // let pushParams = Object.assign({}, params);
  //     // const getNotice = await notify.get(msgType);
  //     // const notice = await getNotice(params, this.nativeLanguage);
  //     // pushParams.myProfile = this.toJSON();
  //     // pushParams.myProfileId = this.id;
  //     // pushParams.title = notice;
  //     // pushParams.type = msgType;
  //     // const notifications = await this.getNotifications();
  //     // pushParams.notificationsCount = notifications.all;
  //     // pushParams = onlyId(pushParams);
  //     // // await this.sendEmail(JSON.stringify(pushParams, null, 4))
  //     // // console.log(pushParams)
  //     // const result = await ctx.services.PushNotifications.pushSend(this.devices, pushParams);
  //     // console.log(result);
  //     // return result;
  //   } catch (err) {
  //     console.error(err);
  //     return err;
  //   }
  // };
  //
  // schema.methods.getEvents = async function (params = {}) {
  //   const { Event } = ctx.models;
  //   const query = {
  //     participants: {
  //       $in: [this._id],
  //     },
  //     status: {
  //       $ne: 'REJECTED',
  //     },
  //   };
  //   return Event
  //     .find(Object.assign(query, params))
  //     .sort('startDate');
  // };
  // schema.methods.getFutureEvents = async function (params = {}) {
  //   const { startDateTimeout } = ctx.config.logic.events;
  //   const query = {
  //     startDate: {
  //       $gte: new Date() - startDateTimeout * 1000,
  //     },
  //   };
  //   Object.assign(query, params);
  //   return this.getEvents(query);
  // };
  //
  // schema.methods.getNotifications = async function () {
  //   const { Request } = ctx.models.v2;
  //   const counts = {
  //     all: 0,
  //     events: 0,
  //     requests: 0,
  //     messages: 0,
  //   };
  //   const profileId = this._id;
  //   const { startDateTimeout } = ctx.config.logic.requests;
  //   let requests = await Request.find({
  //     $or: [
  //       {
  //         to: profileId,
  //         status: 'REVIEW',
  //         startDate: {
  //           $gte: new Date() - startDateTimeout,
  //         },
  //         // reviewer: profileId,
  //       },
  //       {
  //         to: profileId,
  //         status: 'REVIEW',
  //         startDate: null,
  //         // reviewer: profileId,
  //       },
  //     ],
  //   })
  //     .populate('from', { select: ['_id'] })
  //     .populate('to', { select: ['_id'] })
  //     .select(['from', 'to']);
  //   counts.messages = await this.getCountUnreadedMessages();
  //   requests = requests.filter(request => request.from && request.to);
  //   counts.requests = requests.length || 0;
  //   counts.all = counts.requests + counts.events + counts.messages;
  //   return counts;
  // };
  //
  // schema.methods.getGeneralRequest = async function (profileId) {
  //   const myId = this._id;
  //   const query = {};
  //   const currentDate = new Date();
  //   const { startDateTimeout } = ctx.config.logic.requests;
  //   const date = currentDate - startDateTimeout;
  //   query.$or = [
  //     {
  //       to: myId,
  //       startDate: null,
  //       status: {
  //         $in: ['REVIEW', 'ACCEPTED'],
  //       },
  //     },
  //     {
  //       from: myId,
  //       startDate: null,
  //       status: {
  //         $in: ['REVIEW', 'ACCEPTED'],
  //       },
  //     },
  //     {
  //       to: myId,
  //       startDate: {
  //         $gte: date,
  //       },
  //       status: {
  //         $in: ['REVIEW', 'ACCEPTED'],
  //       },
  //     },
  //     {
  //       from: myId,
  //       startDate: {
  //         $gte: date,
  //       },
  //       status: {
  //         $in: ['REVIEW', 'ACCEPTED'],
  //       },
  //     },
  //   ];
  //   if (profileId) {
  //     query.$or[0].from = profileId;
  //     query.$or[1].to = profileId;
  //     query.$or[2].from = profileId;
  //     query.$or[3].to = profileId;
  //   }
  //   return ctx.models.Request
  //     .findOne(query)
  //     .select(['_id', 'help', 'status', 'from', 'to', 'reviewer', 'sender', 'place', 'startDate'])
  //     .sort({ createdAt: -1 });
  // };
  //
  // schema.methods.getLastRequest = async function (profileId, params) {
  //   const myId = this._id;
  //   const query = {};
  //   const currentDate = new Date();
  //   const { startDateTimeout } = ctx.config.logic.requests;
  //   // query.$or = [
  //   //   {
  //   //     to: myId,
  //   //     status: 'REVIEW',
  //   //     startDate: null,
  //   //   },
  //   //   {
  //   //     from: myId,
  //   //     status: 'REVIEW',
  //   //     startDate: null,
  //   //   },
  //   // ]
  //   query.$or = [
  //     {
  //       to: myId,
  //       startDate: null,
  //       status: 'REVIEW',
  //     },
  //     {
  //       from: myId,
  //       startDate: null,
  //       status: 'REVIEW',
  //     },
  //     {
  //       to: myId,
  //       startDate: {
  //         $gte: currentDate - startDateTimeout,
  //       },
  //       status: 'REVIEW',
  //     },
  //     {
  //       from: myId,
  //       startDate: {
  //         $gte: currentDate - startDateTimeout,
  //       },
  //       status: 'REVIEW',
  //     },
  //   ];
  //   if (profileId) {
  //     query.$or[0].from = profileId;
  //     query.$or[1].to = profileId;
  //     query.$or[2].from = profileId;
  //     query.$or[3].to = profileId;
  //   }
  //   if (params) {
  //     Object.assign(query.$or[0], params);
  //     Object.assign(query.$or[1], params);
  //     Object.assign(query.$or[2], params);
  //     Object.assign(query.$or[3], params);
  //   }
  //   // console.log(JSON.stringify(query, null, 4))
  //   return ctx.models.Request
  //     .findOne(query)
  //     .populate('from')
  //     .populate('to')
  //     .sort({ createdAt: -1 });
  // };
  //
  schema.methods.generateAuthToken = function (params) {
    return jwt.sign(this.getIdentity(params), app.config.jwt.secret);
  };
  //
  // schema.methods.getCoords = async function () {
  //   const coords = {
  //     lat: this.loc[0],
  //     lng: this.loc[1],
  //   };
  //   return coords;
  // };
  //
  // schema.methods.setCoords = async function ({ lat, lng }) {
  //   if (!lat) {
  //     throw e404('lat is not found');
  //   }
  //   if (!lng) {
  //     throw e404('lng is not found');
  //   }
  //   this.loc = [lng, lat];
  // };
  // schema.methods.getSuitableEvents = async function (params) {
  //   const { Event } = ctx.models;
  //   return Event.find({
  //     language: {
  //       $in: this.learningLanguages,
  //     },
  //     startDate: {
  //       $lte: moment()
  //         .day(ctx.config.logic.events.periodicNewsletterStartDate)
  //         .format('LLL'),
  //       $gte: moment()
  //         .format('LLL'),
  //     },
  //   });
  // };
  // schema.methods.isMyJay = async function (id) {
  //   const jays = await this.getMyJays();
  //   return new Promise((resolve) => {
  //     jays.forEach((jay) => {
  //       if (jay.id === id) return resolve(true);
  //     });
  //     return resolve(false);
  //   });
  // };
  // schema.methods.getMyJays = async function (findParams = {}) {
  //   const { Message } = ctx.modules.chat.models;
  //   const { Request } = ctx.models.v2;
  //   const myId = this.id;
  //   const requests = await Request.find({
  //     $or: [
  //       {
  //         from: myId,
  //         status: 'ACCEPTED',
  //       }, {
  //         to: myId,
  //         status: 'ACCEPTED',
  //       },
  //     ],
  //   })
  //     .select(['from', 'to']);
  //   let ids = [];
  //   for (const request of requests) {
  //     if (request.from && request.from.toString && myId !== request.from.toString()) {
  //       ids.push(request.from.toString());
  //     }
  //     if (request.to && request.to.toString && myId !== request.to.toString()) {
  //       ids.push(request.to.toString());
  //     }
  //   }
  //   const { messagesFromMe, messagesToMe } = await Promise.props({
  //     messagesFromMe: Message.find({
  //       from: this.id,
  //       subjectType: 'profile',
  //       subjectId: { $regex: this.id, $options: 'i' },
  //     }),
  //     messagesToMe: Message.find({
  //       from: {
  //         $ne: this.id,
  //       },
  //       subjectType: 'profile',
  //       subjectId: { $regex: this.id, $options: 'i' },
  //     }),
  //   });
  //   messagesToMe.forEach((message) => {
  //     if (message.from) {
  //       const id = message.from;
  //       if (ids.indexOf(id) === -1) {
  //         ids.push(id);
  //       }
  //     }
  //   });
  //   messagesFromMe.forEach((message) => {
  //     message.to = message.getToProfileId();
  //     if (message.to) {
  //       const id = message.to;
  //       if (ids.indexOf(id) === -1) {
  //         ids.push(id);
  //       }
  //     }
  //   });
  //   ids = ids.map((id) => mongoose.Types.ObjectId(id)) // eslint-disable-line
  //   const query = {
  //     _id: {
  //       $ne: this._id,
  //       $in: ids,
  //     },
  //     deleted: false,
  //   };
  //   Object.assign(query, findParams);
  //   const res = await this.constructor.find(query)
  //     .select(['status', 'accountType', 'city', 'avatar', 'learningLanguages', 'nativeLanguage', 'email', 'description', 'firstName', 'lastName', 'lastVisitedAt', 'loc', 'bdate']);
  //   return res;
  // };
  // // НАЙТИ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ ВОЗЛЕ МЕНЯ. distance указывается в КМ
  // schema.methods.findNearestUsers = async function (distance, findParams = {}) {
  //   if (!this.loc || this.loc[0] == null || this.loc[1] == null) {
  //     return [];
  //   }
  //   let query = {
  //     _id: {
  //       $ne: this._id,
  //     },
  //   };
  //   if (distance) {
  //     query.loc = {};
  //     query.loc.$near = {
  //       $maxDistance: distance * 1000,
  //       $geometry: {
  //         type: 'Point',
  //         coordinates: this.loc,
  //       },
  //     };
  //   }
  //   query = Object.assign(query, findParams);
  //   const profiles = await this.constructor.find(query);
  //   return profiles || [];
  // };
  // schema.statics.getCoords = async function (profileId) {
  //   const profile = await this.findById(profileId).then(ctx.helpers.checkNotFound);
  //   return profile.getCoords();
  // };
  // schema.statics.setCoords = async function (profileId, coords) {
  //   const profile = await this.findById(profileId).then(ctx.helpers.checkNotFound);
  //   profile.setCoords(coords);
  //   return profile.save();
  // };
  schema.statics.getOptions = async function (profileId) {
    const profile = await this
      .findById(profileId);
    if (!profile) app.e(400, 'profile');
    return profile.getOptions();
  };
  schema.statics.setOptions = async function (profileId, params = {}) {
    const profile = await this
      .findById(profileId);
    if (!profile) throw app.e(400, 'profile');
    return profile.setOptions(params);
  };
  //
  // schema.statics.updateLastVisit = async function (profileId) {
  //   try {
  //     const profile = await this.findById(profileId);
  //     if (profile && profile._id) {
  //       profile.lastVisitedAt = new Date();
  //       return profile.save();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     return null;
  //   }
  // };
  //
  // // Для локальное регистрации
  // schema.statics.generatePassword = function (length = 8) {
  //   return Math.random().toString(36).substr(2, length);
  // };
  // schema.statics.saveLastVisited = async function () {
  //   const { Profile } = ctx.models;
  //   const profiles = await Profile.find();
  //   const promises = profiles.map((profile) => {
  //     if (profile.lastVisitedAt) {
  //       if (profile.lastVisitedAt &&
  //         profile._lastVisitedAt &&
  //         new Date(profile.lastVisitedAt) > new Date(profile._lastVisitedAt)) {
  //         profile._lastVisitedAt = profile.lastVisitedAt;
  //         return profile.save();
  //       }
  //       if (profile.lastVisitedAt && !profile._lastVisitedAt) {
  //         profile._lastVisitedAt = profile.lastVisitedAt;
  //         return profile.save();
  //       }
  //     }
  //     return null;
  //   });
  //   return Promise.all(promises);
  // };
  // schema.statics.runSaveLastVisited = function () {
  //   return setInterval(this.saveLastVisited, 1000 * 60 * 15);
  // };
  // // Периодическое уведомление о групповых встречах, раз в неделю
  schema.statics.runPeriodicNotificationEvents = async function () {
    const { ProfileModel } = app.models;
    return Schedule.scheduleJob({
      dayOfWeek: 5,
      hour: 12,
      minute: 0,
    }, async () => {
      const profiles = await ProfileModel.find({
        deleted: false,
      });
      return profiles.map(profile => profile.getSuitableEvents()
        .then(events => profile
          .notifyEmail('group_meetings', { events: events.map(event => event.toJSON()) })));
    });
  };

  schema.methods.verifyPassword = async function (password) {
    // return this.password === password
    return bcryptCompare(password, this.password);
  };

  schema.methods.getMessagesFromUsers = async function (params = {}) {
    const { MessageSocketModel } = app.models;
    return MessageSocketModel.find({
      subjectId: { $regex: this._id.toString(), $options: 'i' },
      subjectType: 'profile',
      from: {
        $ne: this._id,
      },
      ...params,
    });
  };

  schema.methods.getMessages = async function (params = {}) {
    const { MessageSocketModels } = app.models;
    return MessageSocketModels.find({
      subjectId: { $regex: this._id.toString(), $options: 'i' },
      subjectType: 'profile',
      ...params,
    });
  };

  schema.methods.getDialogs = async function (params = {}) {
    const messages = await this.getMessages(params);
    const dialogs = {};
    messages
      .map((message) => {
        message.to = message.getToProfileId();
        return message;
      })
      .filter(message => message.from && message.to)
      .forEach((message) => {
        const companionId = message.from.toString() === this.id ? message.to : message.from;
        if (!dialogs[companionId]) {
          dialogs[companionId] = [];
        }
        dialogs[companionId].push(message);
      });
    return dialogs;
  };
  //
  schema.methods.getChatDialogs = async function (params = {}) {
    const { MessageSocketModel } = app.models;
    const messages = await MessageSocketModel.aggregate([
      {
        $match: {
          subjectType: 'profile',
          subjectId: { $regex: this._id.toString(), $options: 'i' },
          ...params,
        },
      },
      {
        $group: {
          _id: '$subjectId',
          count: { $sum: 1 },
        },
      },
    ]);
    const dialogs = {};
    messages.map((message) => {
      const ids = message._id.split('_');
      let companionId = null;
      if (ids[0] !== this.id) [companionId] = ids;
      if (ids[1] !== this.id) [, companionId] = ids;
      message.companionId = companionId;
      return message;
    })
      .filter(message => message.companionId)
      .forEach((message) => {
        dialogs[message.companionId] = message.count;
      });
    return dialogs;
  };
  //
  // schema.methods.getCountUnreadedMessages = async function () {
  //   const { Message } = ctx.modules.chat.models;
  //   const messages = await Message.aggregate([
  //     {
  //       $match: {
  //         status: 'UNREAD',
  //         subjectId: { $regex: this._id.toString(), $options: 'i' },
  //         subjectType: 'profile',
  //         from: {
  //           $ne: this.id,
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$from',
  //         count: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   return messages.length;
  // };
  // schema.methods.getCountUnreadedMessagesFromProfile = async function (profileId) {
  //   const { Message } = ctx.modules.chat.models;
  //   const messages = await Message.aggregate([
  //     {
  //       $match: {
  //         from: profileId,
  //         status: 'UNREAD',
  //         subjectType: 'profile',
  //         subjectId: { $regex: this._id.toString(), $options: 'i' },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$from',
  //         count: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   if (messages && messages[0] && messages[0].count) {
  //     return messages[0].count;
  //   }
  //   return 0;
  // };
  // schema.methods.readAllMessagesFromProfile = async function (profileId) {
  //   const { Message } = ctx.modules.chat.models;
  //   const messages = await Message.find({
  //     status: 'UNREAD',
  //     from: profileId,
  //     subjectType: 'profile',
  //     subjectId: { $regex: this._id.toString(), $options: 'i' },
  //   });
  //   const promises = messages.map((message) => {
  //     message.status = 'READ';
  //     return message.save();
  //   });
  //   return Promise.all(promises);
  // };
  // // Взять настройки юзера
  schema.methods.getOptions = async function () {
    const { OptionsModel } = app.models;
    return OptionsModel.findOne({
      profile: this._id,
    });
  };
  // // Изменить настройки
  schema.methods.setOptions = async function (params = {}) {
    const { OptionsModel } = app.models;
    const options = await OptionsModel.findOne({
      profile: this.id,
    });
    omit(params, ['profile']);
    Object.assign(options, params);
    return options.save();
  };
  // schema.methods.getReview = async function (params = {}) {
  //   const { Review } = ctx.models;
  //   return Review.findOne(Object.assign({
  //     profile: this.id,
  //   }, params));
  // };
  // schema.methods.getReviews = async function (params = {}) {
  //   const { Review } = ctx.models;
  //   return Review.find(Object.assign({
  //     profile: this.id,
  //   }, params));
  // };
  //
  // schema.methods.getSocials = async function () {
  //   const { Passport } = ctx.models;
  //   const passports = await Passport.find({
  //     profileId: this.id,
  //   })
  //     .select(['socialNetworkType', 'linkToSocialNetwork', 'meta']);
  //   return passports.map((passport) => {
  //     return {
  //       name: passport.getName(),
  //       socialNetworkType: passport.socialNetworkType,
  //       linkToSocialNetwork: passport.linkToSocialNetwork,
  //     };
  //   });
  // };
  //
  schema.methods.getIsicCards = async function (params = {}, options = {}) {
    const { IsicCardModel } = app.models;
    const query = merge({
      active: true,
      profileId: this._id,
    }, params);
    let res = IsicCardModel.find(query);
    if (options.select) {
      res = res.select(options.select);
    }
    return res;
  };
  //
  // schema.methods.getPurchases = async function (params = {}) {
  //   const { Purchase } = ctx.models;
  //   const query = {
  //     profileId: this._id,
  //   };
  //   Object.assign(query, params);
  //   return Purchase.find(query);
  // };
  //
  schema.methods.getPurchasesCount = async function (params = {}) {
    const { PurchaseModel } = app.models;
    const query = {
      profileId: this._id,
    };
    Object.assign(query, params);
    return PurchaseModel.count(query);
  };
  //
  schema.methods.updateAccountType = async function () {
    if (this._accountType) {
      if (this.accountType === 'PREMIUM' && this._accountType !== 'PREMIUM') {
        this.setOptions({
          showAvatarOnMap: true,
        });
      }
      this.accountType = this._accountType;
      return this;
    }
    let accountType = 'BASIC';
    const { isicCards, purchases } = await Promise.props({
      isicCards: this.getIsicCards(),
      purchases: this.getPurchasesCount({
        // isSubscription: true,
        isActive: true,
      }),
    });
    if (isicCards.length > 0) {
      accountType = 'ISIC';
    }
    if (purchases > 0) {
      accountType = 'PREMIUM';
    }
    if (this.accountType === 'PREMIUM' && accountType !== 'PREMIUM') {
      this.setOptions({
        showAvatarOnMap: true,
      });
    }
    this.accountType = accountType;
    return this;
  };
  //
  // schema.statics.initBlock = async function () {
  //   const profiles = await this.find({
  //     blocked: true,
  //   })
  //     .select('_id blocked');
  //   return profiles.forEach((profile) => {
  //     return ctx.services.RedisService.set(`profile_blocked_${profile.id}`, profile.blocked);
  //   });
  // };
  //
  schema.methods.getLimit = async function (type) {
    const { Limit, Event, Purchase } = app.models;
    const { accountType } = this;
    const limits = await Limit.get(accountType.toLowerCase());
    if (type === 'chooseStatus') {
      return limits.chooseStatus;
    } if (type === 'noAds') {
      return limits.noAds;
    } if (type === 'searchRadiusLimit') {
      return limits.searchRadiusLimit;
    } if (type === 'hideAvatarInMap') {
      return limits.hideAvatarInMap;
    } if (type === 'photosInProfile') {
      return limits.photosInProfile;
    } if (type === 'searchNativeLanguages') {
      return limits.searchNativeLanguages;
    } if (type === 'learningLanguagesCount') {
      return limits.learningLanguagesCount;
    } if (type === 'eventsCountInMonth') {
      if (limits.eventsCountInMonth === -1) return -1;
      const lastEvent = await Event.findOne({
        owner: this.id,
      })
        .sort({
          createdAt: -1,
        });
      const createdAt = {
        $gte: moment().add(-30, 'days').toDate(),
      };
      if (lastEvent) {
        createdAt.$lte = lastEvent.createdAt;
      }
      const { eventsCount, buyEvents } = await Promise.props({
        eventsCount: Event.count({
          owner: this._id,
          createdAt,
        }),
        buyEvents: this.getPurchasesCount({
          'data.productId': 'buy_1_meeting',
          isActive: true,
        }),
      });
      app.log.info({ 'limits.eventsCountInMonth': limits.eventsCountInMonth, eventsCount });
      let count = limits.eventsCountInMonth - eventsCount;
      if (count < 0) count = 0;
      count += buyEvents;
      return count;
    } if (type === 'basicDialogsCountInWeek') {
      const max = limits.basicDialogsCountInWeek;
      if (max === -1) return max;
      const { MessageSocketModel } = app.models;
      const lastMessage = await MessageSocketModel.findOne({
        subjectType: 'profile',
        subjectId: { $regex: this.id, $options: 'i' },
        from: this.id,
      })
        .sort({
          createdAt: -1,
        });
      let dialogs = [];
      if (lastMessage) {
        dialogs = await this.getChatDialogs({
          createdAt: {
            $gte: moment().startOf('day').toDate(),
            $lte: lastMessage.createdAt,
          },
        });
      }
      const promises = map(dialogs, (message, from) => this.constructor
        .findById(from)
        .select('accountType'));
      dialogs = await Promise.all(promises);
      dialogs = dialogs.filter(dialog => dialog && dialog.accountType === 'BASIC');
      const count = limits.basicDialogsCountInWeek - dialogs.length;
      if (count < 0) return 0;
      return count;
    }
    return null;
  };

  // schema.methods.getLimitRest = async function (type) {
  //   const { Limit, Event } = ctx.models;
  //   const { Message } = ctx.modules.chat.models;
  //   const { accountType } = this;
  //   const limits = await Limit.get(accountType.toLowerCase());
  //   if (type === 'eventsCountInMonth') {
  //     if (limits.eventsCountInMonth === -1) return -1;
  //     const event = await Event.findOne({
  //       owner: this.id,
  //       createdAt: {
  //         $gte: moment().add(-30, 'days').toDate(),
  //       },
  //     })
  //       .sort({
  //         createdAt: -1,
  //       });
  //     if (!event) return moment().endOf('month').toDate();
  //     return moment(new Date(event.createdAt)).add(1, 'month').toDate();
  //   } else if (type === 'basicDialogsCountInWeek') {
  //     const max = limits.basicDialogsCountInWeek;
  //     if (max === -1) return max;
  //     const message = await Message.findOne({
  //       from: this._id,
  //     })
  //       .sort({
  //         createdAt: -1,
  //       });
  //     if (!message) return moment().endOf('day').toDate();
  //     return moment(new Date(message.createdAt)).add(1, 'day').toDate();
  //   }
  //   return null;
  // };
  //
  // schema.methods.getLimitsRest = async function () {
  //   return Promise.props({
  //     eventsCountInMonth: this.getLimitRest('eventsCountInMonth'),
  //     basicDialogsCountInWeek: this.getLimitRest('basicDialogsCountInWeek'),
  //   });
  // };
  //
  // schema.methods.getLimits = async function () {
  //   return Promise.props({
  //     chooseStatus: this.getLimit('chooseStatus'),
  //     noAds: this.getLimit('noAds'),
  //     searchRadiusLimit: this.getLimit('searchRadiusLimit'),
  //     hideAvatarInMap: this.getLimit('hideAvatarInMap'),
  //     photosInProfile: this.getLimit('photosInProfile'),
  //     searchNativeLanguages: this.getLimit('searchNativeLanguages'),
  //     learningLanguagesCount: this.getLimit('learningLanguagesCount'),
  //     eventsCountInMonth: this.getLimit('eventsCountInMonth'),
  //     basicDialogsCountInWeek: this.getLimit('basicDialogsCountInWeek'),
  //   });
  // };
  //
  // schema.methods.getDistance = function ({ lat, lng }) {
  //   return calcDistance(this.lat, this.lng, lat, lng);
  // };
  //
  // schema.methods.setIsicCards = async function (ids = []) {
  //   const { IsicCard } = ctx.models;
  //   let { isicCards, myIsicCards } = await Promise.props({
  //     myIsicCards: this.getIsicCards(),
  //     isicCards: IsicCard.find({
  //       active: true,
  //       expDate: {
  //         $gte: moment(new Date()).seconds(10).toDate(),
  //       },
  //       _id: {
  //         $in: ids,
  //       },
  //       $or: [
  //         {
  //           profileId: null,
  //         },
  //         {
  //           profileId: this._id,
  //         },
  //       ],
  //     }),
  //   });
  //   isicCards = groupBy(isicCards, '_id');
  //   const promises = myIsicCards.map((myIsiCard) => {
  //     if (!isicCards[myIsiCard._id]) {
  //       return myIsiCard.unbind();
  //     }
  //     return null;
  //   });
  //   return Promise.all(promises);
  // };

  return schema;
}
