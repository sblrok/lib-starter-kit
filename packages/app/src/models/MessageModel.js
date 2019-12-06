import MongooseSchema from '@lskjs/db/MongooseSchema';

export default function MessageModel(app) {
  const { db } = app;
  const schema = new MongooseSchema({
    chatId: {
      type: db.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    userId: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: Object,
    },
    editedAt: {
      type: Date,
    },
    removedAt: {
      type: Date,
    },
    // viewUserIds
    viewedAt: {
      type: Date,
    },
  }, {
    model: 'Message',
    collection: 'message',
  });


  schema.statics.views = {};
  schema.statics.views.tiny = [
    '_id',
    'content',
    'userId',
    'chatId',
    'createdAt',
  ];
  schema.statics.views.default = [
    ...schema.statics.views.tiny,
  ];


  return schema;
}
