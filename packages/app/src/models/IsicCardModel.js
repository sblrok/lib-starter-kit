import MongooseSchema from '@lskjs/db/MongooseSchema';

export default function MessageModel({ db }) {
  const schema = new MongooseSchema(
    {
      title: {
        type: String,
        // trim: true,
        // default() { this.number }, ???
      },
      userId: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      number: {
        type: String,
        required: true,
        // lowerCase: true,
        // trim: true,
      },
      bdate: {
        type: Date,
        required: true,
        // trim: true,
      },
      exp: {
        type: Date,
        required: true,
      },
      // expDate: {
      //   type: Date,
      //   required: true,
      // },
      active: {
        type: Boolean,
        default: false,
      },
      // lastProfileId: {
      //   default: null,
      //   type: db.Schema.Types.ObjectId,
      //   ref: 'Profile',
      // },
    },
    {
      model: 'IsicCard',
      collection: 'isiccards',
      // timestamps: true,
    },
  );

  return schema;
}
