import MongooseSchema from '@lskjs/db/MongooseSchema';
import omit from 'lodash/omit';

export default function MessageModel({ db }) {
  const schema = new MongooseSchema(
    {
      message_id: {
        type: Number,
      },
      from: {
        type: Object,
      },
      date: {
        type: Number,
      },
      chat: {
        type: Object,
      },
      forward_from: {
        type: Object,
      },
      forward_from_chat: {
        type: Object,
      },
      forward_from_message_id: {
        type: Number,
      },
      forward_signature: {
        type: String,
      },
      forward_sender_name: {
        type: String,
      },
      forward_date: {
        type: Number,
      },
      reply_to_message: {
        type: Object,
      },
      edit_date: {
        type: Number,
      },
      media_group_id: {
        type: String,
      },
      author_signature: {
        type: String,
      },
      text: {
        type: String,
      },
      entities: {
        type: Array,
      },
      caption_entities: {
        type: Array,
      },
      audio: {
        type: Object,
      },
      document: {
        type: Object,
      },
      animation: {
        type: Object,
      },
      game: {
        type: Object,
      },
      photo: {
        type: Array,
      },
      sticker: {
        type: Object,
      },
      video: {
        type: Object,
      },
      voice: {
        type: Object,
      },
      video_note: {
        type: Object,
      },
      caption: {
        type: String,
      },
      contact: {
        type: Object,
      },
      location: {
        type: Object,
      },
      venue: {
        type: Object,
      },
      poll: {
        type: Object,
      },
      new_chat_members: {
        type: Array,
      },
      left_chat_member: {
        type: Object,
      },
      new_chat_title: {
        type: String,
      },
      new_chat_photo: {
        type: Array,
      },
      delete_chat_photo: {
        type: Boolean,
      },
      group_chat_created: {
        type: Boolean,
      },
      supergroup_chat_created: {
        type: Boolean,
      },
      channel_chat_created: {
        type: Boolean,
      },
      migrate_to_chat_id: {
        type: Number,
      },
      migrate_from_chat_id: {
        type: Number,
      },
      pinned_message: {
        type: Object,
      },
      invoice: {
        type: Object,
      },
      successful_payment: {
        type: Object,
      },
      connected_website: {
        type: String,
      },
      passport_data: {
        type: Object,
      },
      reply_markup: {
        type: Object,
      },
    },
    {
      model: 'Message',
      collection: 'messages',
    },
  );

  // const indexes = [
  //   {
  //     userId: 1,
  //   },
  //   {
  //     chatId: 1,
  //   },
  //   {
  //     botId: 1,
  //   },
  // ];
  // indexes.forEach((index) => {
  //   schema.index(index);
  // });
  schema.statics.prepareOne = async function (obj) {
    return omit(obj.toObject(), ['private']);
  };

  return schema;
}
