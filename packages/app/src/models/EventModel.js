import MongooseSchema from '@lskjs/db/MongooseSchema';
import merge from 'lodash/merge';
import uniqBy from 'lodash/uniqBy';
import pick from 'lodash/pick';
import find from 'lodash/find';

// import dbSchema from '@lskjs/db/dbSchema';

// export default function EventModel(app) {
//   const { db } = app;
//   const schema = new Schema({
//     chatId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Chat',
//     },
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     content: {
//       type: Object,
//     },
//     editedAt: {
//       type: Date,
//     },
//     removedAt: {
//       type: Date,
//     },
//     // viewUserIds
//     viewedAt: {
//       type: Date,
//     },
//   }, {
//     model: 'Message',
//     collection: 'message',
//   });


//   schema.statics.views = {};
//   schema.statics.views.tiny = [
//     '_id',
//     'content',
//     'userId',
//     'chatId',
//     'createdAt',
//   ];
//   schema.statics.views.default = [
//     ...schema.statics.views.tiny,
//   ];


//   return schema;
// }


export default function getSchema(app) {
  const placeApi = app.modules.places;
  const { db } = app;
  const { Schema } = db;
  const reportTimeDifferent = 4 * 60 * 60 * 1000;
  const schema = new MongooseSchema({
    language: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    finishedAt: {
      type: Date,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // app.models.getName()
    },
    image: {
      type: db.Schema.Types.ObjectId,
      ref: 'Image', // ctx.models.getName()
    },
    lastMessage: {
      type: String,
      default: '',
    },
    loc: {
      type: [Number],
      index: '2dsphere',
      default: null,
    },
    status: {
      type: String,
      enum: ['private', 'public', 'reject'],
      default: 'public',
    },
    online: {
      type: Boolean,
      default: true,
    },
    place: {
      type: Object,
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
      photo: {
        type: String,
        default: '',
      },
      price: {
        type: Number,
        default: 0,
      },
    },
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // app.models.getName()
      },
    ],
  }, {
    model: 'Event',
    collection: 'event',
    // timestamps: true,
    // toObject: {
    //   virtuals: true,
    // },
    // toJSON: {
    //   virtuals: true,
    // },
  });


  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'language',
    'title',
    'description',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
    'startedAt',
    'finishedAt',
    'userId',
    'image',
    'lastMessage',
    'loc',
    'status',
    'online',
    'place',
    'user',
    'users',
  ];

  schema.methods.getLoc = function () {
    let lng;
    if (this.loc && this.loc[0]) {
      lng = this.loc[0];
    } else if (this.place && this.place.lng) {
      lng = this.place.lng;
    } else {
      lng = 0;
    }
    let lat;
    if (this.loc && this.loc[1]) {
      lat = this.loc[1];
    } else if (this.place && this.place.lat) {
      lat = this.place.lat;
    } else {
      lat = 0;
    }
    return [lng, lat];
  };


  schema.statics.prepareOne = async function (obj, params = {}) {
    const { req } = params;
    const userId = req && req.user && req.user._id;
    // const { req } = params;
    const select = this.getSelect(params);
    // const userId = req && req.user && req.user._id;
    const res = pick(obj.toObject(), select);
    const { UserModel, EventUserModel } = app.models;

    if (select.includes('relation') && userId) {
      const relation = await EventUserModel.findOne({ eventId: res._id, userId }).select(['createdAt', 'value']);
      if (relation) {
        res.relation = await EventUserModel.prepare(relation, { req });
      } else {
        res.relation = null;
      }
    }
    if (select.includes('user') && res.userId) {
      const user = await UserModel.findById(res.userId).select(UserModel.views.tiny);
      res.user = await UserModel.prepare(user, { req });
    }
    if (select.includes('users') && res.userIds) {
      const users = await UserModel.find({ _id: res.userIds }).select(UserModel.views.tiny);
      res.users = await UserModel.prepare(users, { req });
    }

    if (res.image || res.photos) {
      res.photos = await obj.getPhotos();
    }

    if (res.photos && res.photos[0]) {
      res.image = res.photos[0].original;
    } else {
      res.image = app.url('/static/default-event.png');
    }

    return res;
  };


  schema.methods.getPhotos = async function () {
    const resPhotos = this.photos || [this.image];
    const { ImageModel } = app.models;
    let photos = await ImageModel.find({
      _id: {
        $in: resPhotos,
      },
    }).select(['createdAt', 'info', 'path']);

    photos = photos.map(photo => ({
      ...photo.getUrls(),
      _id: photo._id,
    }));

    // console.log({photos});

    return resPhotos.map(_id => find(photos, { _id })).filter(photo => !!photo);
  };


  // ======================


  schema.pre('save2', function (next) {
    const { isBase64 } = app.helpers;
    const promises = [];
    if (this.isModified('coverImage') && isBase64(this.coverImage)) {
      const promise = async () => this.saveCoverImage();
      promises.push(promise());
    }
    if (this.isModified('place') && typeof (this.place) === 'string') {
      const promise = async () => {
        this.place = await placeApi.get(this.place) || this.place;
        try {
          if (!Array.isArray(this.loc)) {
            this.loc = [this.place.lng, this.place.lat];
          }
        } catch (err) {
          console.error('wtf');
        }
      };
      promises.push(promise());
    }
    if (this.coverImage && this.coverImage.indexOf('?timestamps=') === -1) {
      this.coverImage = `${this.coverImage}?timestamps=${new Date().getTime()}`;
    }
    if (this.place && this.place.lng && this.place.lat) {
      this.loc = [this.place.lng, this.place.lat];
    }
    return Promise
      .all(promises)
      .then(this
        .handleOnChangePlaceOrStartDate({
          startDate: this.isModified('startDate'),
          place: this.isModified('place'),
        }))
      .then(next);
  });

  schema.methods.toJSON2 = function () {
    const event = this.toObject();
    event.id = event._id;
    if (event.coverImage[0] === '/') {
      event.coverImage = `${app.config.protocol}://${app.config.host}:${app.config.external_port}${event.coverImage}`;
    }
    if (!event.lastMessage) event.lastMessage = '';
    delete event._id;
    delete event.__v;
    return event;
  };

  schema.methods.handleOnChangePlaceOrStartDate = function ({ startDate, place }) {
    return async () => {
      try {
        if (!startDate && !place) return true;
        const participants = await this.getParticipants({
          _id: {
            $ne: this.user,
          },
        });
        let pushType;
        let emailType;
        if (startDate && place) {
          pushType = 'msg22';
          emailType = 'change_place_time_group_meeting';
        }
        if (startDate && !place) {
          pushType = 'msg15';
          emailType = 'change_time_group_meeting';
        }
        if (!startDate && place) {
          pushType = 'msg14';
          emailType = 'change_place_group_meeting';
        }
        return participants.map((participant) => {
          participant.notifyEmail(emailType, { event: this.toJSON() });
          participant.notify(pushType, {
            event: this,
            profile: participant,
            eventId: this.id,
            profileId: participant.id,
          });
          return true;
        });
      } catch (err) {
        console.error(err);
        return false;
      }
    };
  };

  schema.methods.getParticipants = async function (params = {}) {
    const { UserModel } = app.models;
    const participantsId = this.participants;
    const findParams = {
      _id: {
        $in: participantsId,
      },
    };
    merge(findParams, params);
    return UserModel.find(findParams);
  };

  schema.methods.saveCoverImage = async function () {
    const title = `event_${this.id}`;
    const path = await app.helpers.saveFile(title, this.coverImage);
    const timestamp = `?timestamps=${new Date().getTime()}`;
    this.coverImage = `${path}${timestamp}`;
    return this;
  };

  schema.methods.toJsonForFutures = function () {
    const event = this.toJSON();
    let place = '';
    if (event.place && event.place.address) {
      place = event.place.address;
    }
    event.place = place;
    return event;
  };
  // schema.plugin(app.dbRenameId({newIdName: 'id'}));

  schema.methods.participantsToJSON = async function () {
    const { UserModel } = app.models;
    const participants = [];
    for (const participant of this.participants) {
      const profileId = participant._id || participant;
      const profile = await UserModel.findById(profileId);
      if (profile) {
        participants.push(profile.toJSON());
      }
    }
    return participants;
  };

  // Послать email о групповых встречах(раз в 14 дней)

  schema.methods.isParticipant = function (profileId) {
    let result = false;
    this.participants.forEach((participant) => {
      if (participant == profileId || participant._id == profileId) {
        result = true;
      }
    });
    return result;
  };

  schema.methods.isWantVisit = function (profileId) {
    if (this.participants.indexOf(profileId) === -1) return false;
    return true;
  };

  schema.methods.profileIsVisited = function (profileId) {
    let result = true;
    if (this.participants.indexOf(profileId.toString()) === -1) {
      this.participants.push(profileId);
      result = false;
    }
    return result;
  };


  schema.methods.addParticipant = async function (profileId) {
    if (!profileId) return this;
    if (this.participants.indexOf(profileId) === -1) {
      this.participants.push(profileId);
    }
    this.participants = uniqBy(this.participants, (participant) => {
      try {
        return participant.toString();
      } catch (err) {
        return null;
      }
    });
    return this;
  };

  schema.methods.getTimezone = async function () {
    // console.log(this.lat, this.lng)
    return app.services.GoogleMaps.getTimezone(this.lat, this.lng);
  };
  schema.methods.getLocalTime = async function () {
    const timezone = await this.getTimezone();
    return app.services.GoogleMaps.getDateByTimezone(this.startDate, timezone);
  };

  schema.methods.removeParticipant = async function (profileId) {
    if (this.participants.indexOf(profileId) !== -1) {
      this.participants = this.participants.filter(v => v !== profileId);
    }
  };

  schema.methods.findNearestUsers = async function (distance = 50, findParams) {
    if (!this.loc || !this.loc[0] === undefined || !this.loc[1] === undefined) {
      return [];
    }
    const { UserModel } = app.models;
    const query = {
      deleted: false,
    };
    query.loc = {
      $near: {
        $maxDistance: distance * 1000,
        $geometry: {
          type: 'Point',
          coordinates: this.loc,
        },
      },
    };
    if (typeof (findParams) === 'object') {
      Object.assign(query, findParams);
    }
    return UserModel.find(query);
  };

  schema.statics.getList = async function (params) {
    if (params.lang) {
      params.language = params.lang //eslint-disable-line
      delete params['lang'] //eslint-disable-line
    }
    return this.find(params);
  };

  schema.statics.getFutures = async function () {
    const currentDate = new Date();
    const { startDateTimeout } = app.config.logic.events;
    return this.find({
      startDate: {
        $gte: currentDate - startDateTimeout,
      },
    });
  };

  schema.statics.getUserModelFutures = async function (profileId) {
    const currentDate = new Date();
    const { UserModel } = app.models;
    await UserModel.check(profileId);
    return this.find({
      startDate: {
        $gte: currentDate,
      },
      participants: {
        $in: [profileId],
      },
    });
  };

  schema.statics.get = async function (eventId) {
    const event = await this.findById(eventId).populate('participants');
    return event;
  };

  return schema;
}
