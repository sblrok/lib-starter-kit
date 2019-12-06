import MongooseSchema from '@lskjs/db/MongooseSchema';
import pick from 'lodash/pick';

export default function ChatModel(app) {
  const { db } = app;
  const schema = new MongooseSchema({
    type: {
      type: String,
      enum: ['me', 'private', 'group'],
      // index: true,
    },
    ownerType: {
      type: String,
    },
    ownerId: {
      type: String,
    },
    userIds: {
      type: Array,
      ofObjectId: [db.Schema.Types.ObjectId],
    },
    userRoles: {
      type: Object,
    },
    lastActivityAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    removedAt: {
      type: Date,
    },
    status: {
      type: String,
    },
    read: {
      type: Object,
    },
    disableNotifications: [{
      type: db.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }, {
    model: 'Chat',
    collection: 'chat',
  });


  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'type',
    'ownerType',
    'ownerId',
    'userIds',
    'createdAt',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
    // 'opponent',
    'lastMessage',
    'read',
  ];

  schema.methods.notificationIsDisableForProfile = function (profileId) {
    return this.disableNotifications.indexOf(profileId) !== -1;
  };

  schema.statics.findByUserIds = async function ({ fromUserId, toUserId }) {
    return this.findOne({
      $or: [{
        userIds: [fromUserId, toUserId],
      }, {
        userIds: [toUserId, fromUserId],
      }],
    });
  };

  schema.statics.findOrCreateByUserIds = async function ({ fromUserId, toUserId }, { ownerType, ownerId }) {
    const chat = await this.findByUserIds({ fromUserId, toUserId });
    if (chat) return chat;
    const params = {
      type: 'private',
      ownerType,
      ownerId,
      userIds: [fromUserId, toUserId],
      // userIds: [db.Types.ObjectId(String(fromUserId)), db.Types.ObjectId(String(toUserId))],
    };
    const obj = new this(params);
    await obj.save();
    return obj;
  };

  schema.methods.getOpponentId = function (myUserId) {
    return this.userIds.filter(userId => (String(userId) !== String(myUserId)))[0];
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
    const select = this.getSelect(params);

    const res = pick(obj.toObject(), schema.statics.views[view]);


    if (userId && select.includes('opponent')) {
      const { opponentId, opponent } = await obj.getOpponent(params);
      res.opponentId = opponentId;
      res.opponent = opponent;
    }
    if (select.includes('lastMessage')) {
      const { MessageModel } = app.models;
      const chatId = obj._id;
      const message = await MessageModel.findOne({ chatId }).sort({ createdAt: -1 }).select(MessageModel.views.tiny);
      if (message) {
        res.lastMessage = await MessageModel.prepare(message, { req, view: 'default' });
      }
    }
    if (userId && select.includes('unreadCount')) {
      const { MessageModel } = app.models;
      const { read = {} } = obj;
      const condition = { chatId: obj._id };
      if (read[userId]) {
        condition.createdAt = { $gt: read[userId] };
      }
      res.unreadCount = await MessageModel.count(condition);
    }
    return res;
  };


  return schema;
}
