import MongooseSchema from '@lskjs/db/MongooseSchema';
import pick from 'lodash/pick';

/**
 * Event - User - relation
 * @param { db } database
 */
export default function EventUserModel(app) {
  const { db } = app;
  const schema = new MongooseSchema({
    eventId: {
      type: db.Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    userId: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    value: {
      type: Number,
    },
  }, {
    model: 'EventUser',
    collection: 'event_user',
  })
    .virtual(
      'user', {
        ref: 'User',
        localField: 'userId',
        foreignField: '_id',
        justOne: true,
      },
    )
    .virtual(
      'event', {
        ref: 'Event',
        localField: 'eventId',
        foreignField: '_id',
        justOne: true,
      },
    );


  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'userId',
    // 'user',
    'value',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
    'user',
  ];


  schema.statics.prepareOne = async function (obj, params = {}) {
    const { req } = params;
    const select = this.getSelect(params);
    // const userId = req && req.user && req.user._id;
    const res = pick(obj.toObject(), select);
    const { UserModel } = app.models;

    if (select.includes('user') && res.userId) {
      const user = await UserModel.findById(res.userId).select(UserModel.views.tiny);
      res.user = await UserModel.prepare(user, { req });
    }

    return res;
  };


  return schema;
}
