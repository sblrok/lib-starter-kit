import getPlaceApi from '../../api/v1/place/place.api';
import _ from 'lodash';
export function getSchema(ctx) {
  const placeApi = getPlaceApi(ctx);
  const mongoose = ctx.db;
  const { e404, e500 } = ctx.errors;
  const reportTimeDifferent = 4 * 60 * 60 * 1000;
  const schema = new mongoose.Schema({
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
    startDate: {
      type: Date,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', //ctx.models.getName()
    },
    coverImage: {
      type: String,
      default: '/static/event_background.jpg',
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
      enum: ['PRIVATE', 'PUBLIC', 'REJECTED'],
      default: 'PUBLIC',
      uppercase: true,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile', //ctx.models.getName()
      },
    ],
  }, {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

  schema.virtual('lng').get(function () {
    if (this.loc && this.loc[0]) return this.loc[0];
    if (this.place && this.place.lng) return this.place.lng;
    return null;
  });
  schema.virtual('lat').get(function () {
    if (this.loc && this.loc[1]) return this.loc[1];
    if (this.place && this.place.lat) return this.place.lat;
    return null;
  });

  schema.pre('save', function (next) {
    const { isBase64 } = ctx.helpers;
    const promises = [];
    if (this.isModified('coverImage') && isBase64(this.coverImage)) {
      const promise = async () => {
        return this.saveCoverImage();
      };
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
    if (this.coverImage.indexOf('?timestamps=') === -1) {
      this.coverImage = `${this.coverImage}?timestamps=${new Date().getTime()}`;
    }
    if (this.place.lng && this.place.lat) {
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

  schema.methods.toJSON = function () {
    const event = this.toObject();
    event.id = event._id;
    if (event.coverImage[0] === '/') {
      event.coverImage = `${ctx.config.protocol}://${ctx.config.host}:${ctx.config.external_port}${event.coverImage}`;
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
            $ne: this.owner,
          },
        });
        let pushType;
        let emailType;
        if (startDate && place) {
          pushType = 'msg22'
          emailType = 'change_place_time_group_meeting';
        }
        if (startDate && !place) {
          pushType = 'msg15'
          emailType = 'change_time_group_meeting';
        }
        if (!startDate && place) {
          pushType = 'msg14'
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
    const { Profile } = ctx.models;
    const participantsId = this.participants;
    const findParams = {
      _id: {
        $in: participantsId,
      },
    };
    _.merge(findParams, params);
    return Profile.find(findParams);
  };

  schema.methods.saveCoverImage = async function () {
    const title = `event_${this.id}`;
    const path = await ctx.helpers.saveFile(title, this.coverImage);
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
  // schema.plugin(ctx.mongooseRenameId({newIdName: 'id'}));

  schema.methods.participantsToJSON = async function () {
    const { Profile } = ctx.models;
    const participants = [];
    for (const participant of this.participants) {
      const profileId = participant._id || participant;
      const profile = await Profile.findById(profileId);
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
    this.participants = _.uniqBy(this.participants, (participant) => {
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
    return ctx.services.GoogleMaps.getTimezone(this.lat, this.lng);
  };
  schema.methods.getLocalTime = async function () {
    const timezone = await this.getTimezone();
    return ctx.services.GoogleMaps.getDateByTimezone(this.startDate, timezone);
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
    const { Profile } = ctx.models;
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
    return Profile.find(query);
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
    const { startDateTimeout } = ctx.config.logic.events;
    return this.find({
      startDate: {
        $gte: currentDate - startDateTimeout,
      },
    });
  };

  schema.statics.getProfileFutures = async function (profileId) {
    const currentDate = new Date();
    const { Profile } = ctx.models;
    await Profile.check(profileId);
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

export default(ctx) => {
  return ctx.db.model('Events', getSchema(ctx), 'events');
};
