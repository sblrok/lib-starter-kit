import MongooseSchema from '@lskjs/db/MongooseSchema';

export default function OptionsModel(app) {
  const { db } = app;
  const schema = new MongooseSchema({
    profile: {
      required: true,
      type: db.Schema.Types.ObjectId,
      ref: 'Profile',
    },
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
    AddEditEventsPush: {
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
    AddEditEventsEmail: {
      type: Boolean,
      default: true,
    },
    // Новости приложения
    appNewsEmail: {
      type: Boolean,
      default: true,
    },
  }, {
    timestamps: true,
    collection: 'options',
    model: 'Options',
  });

  schema.statics.createDefault = async function (profileId, params) {
    const options = new this({
      profile: profileId,
      ...params,
    });
    return options.save();
  };

  return schema;
}
