import MongooseSchema from '@lskjs/db/MongooseSchema';
import moment from 'moment';
import Promise from 'bluebird';

export default function MessageSocketModel(app) {
  const { db } = app;
  const schema = new MongooseSchema({
    profile: {
      required: true,
      type: db.Schema.Types.ObjectId,
      ref: 'Profile', // ctx.models.getName()
    },
    from: {
      type: String,
    },
    subjectType: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['READ', 'UNREAD'],
      default: 'UNREAD',
    },
    hidden: [
      {
        type: db.Schema.Types.ObjectId,
        ref: 'Profile', // ctx.models.getName()
      },
    ],
  }, {
    timestamps: true,
    model: 'MessageSocket',
    collection: 'message_socket',
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  });

  schema.pre('save', function (next) {
    const promises = [];
    if (this.isNew) {
      const promise = async () => {
        const { ChatModel } = app.models;
        // const { Chat } = ctx.modules.chat.models;
        const { subjectId, subjectType } = this;
        const count = await ChatModel.findOne({
          subjectId,
          subjectType,
        });
        if (!count) {
          return new ChatModel({
            subjectType,
            subjectId,
          }).save();
        }
        return null;
      };
      promises.push(promise());
      this.runEmailTimer();
    }
    return Promise.all(promises).then(next);
  });

  schema.methods.getToProfile = async function () {
    const { ProfileModel } = app.models;
    const profiles = this.subjectId.split('_');
    let toProfileId;
    if (profiles[0] === this.from) [, toProfileId] = profiles;
    if (profiles[1] === this.from) [toProfileId] = profiles;
    let toProfile = null;
    if (toProfileId) {
      toProfile = await ProfileModel.findById(toProfileId);
    }
    return toProfile;
  };
  schema.methods.getFromProfile = async function () {
    const { ProfileModel } = app.models;
    return ProfileModel.findById(this.from);
  };

  schema.methods.getChat = async function () {
    const { ChatModel } = app.models;
    const { subjectId, subjectType } = this;
    return ChatModel.findOne({
      subjectId,
      subjectType,
    });
  };

  schema.methods.getToProfileId = function () {
    const profiles = this.subjectId.split('_');
    if (profiles[0] === this.from) return profiles[1];
    if (profiles[1] === this.from) return profiles[0];
    return null;
  };

  schema.methods.sendNotify = async function () {
    try {
      if (this.subjectType !== 'profile') return null;
      const {
        to,
        from,
      } = await Promise.props({
        to: this.getToProfile(),
        from: this.getFromProfile(),
      });
      app.log.info('Проверка 1');
      if (!from || !to) return null;
      app.log.info('Проверка 2');
      const chat = await this.getChat();
      if (chat && chat.notificationIsDisableForProfile(to._id)) {
        app.log.info('Проверка 3');
        app.log.info(`Чат ${this.subjectId} отключен!`);
        return null;
      }
      app.log.info('sendNotify', to.name);
      return to.notify('msg9', {
        fromProfile: from,
        fromProfileId: from.id,
        message: this,
      });
    } catch (err) {
      app.log.error(err);
    }
  };

  schema.methods.runEmailTimer = async function () {
    this.stopEmailTimer();
    const date = moment().add(this.app.config.logic.messages.beforeEmailNotify, 'minutes').toDate();
    return this.app.schedule.add(`$message_to_email${this._id}`, date, async () => {
      try {
        const { from, to } = await Promise.props({
          from: this.getFromProfile(),
          to: this.getToProfile(),
        });
        if (from && to && from.notifyEmail && to.notifyEmail) {
          return to.notifyEmail('message', { profile: from.toJSON() });
        }
        return false;
      } catch (err) {
        app.log.error(err);
      }
    });
  };
  schema.methods.stopEmailTimer = async function () {
    return app.schedule.cancel(`$message_to_email${this._id}`);
  };


  return schema;
}
