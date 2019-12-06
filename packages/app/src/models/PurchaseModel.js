import MongooseSchema from '@lskjs/db/MongooseSchema';
import get from 'lodash/get';
// import omit from 'lodash/omit';
// import moment from 'moment';

export const subscriptionIds = [
  'isic_to_premium_1_month',
  'isic_to_premium_3_month',
  'isic_to_premium_3_months',
  'isic_to_premium_6_month',
  'isic_to_premium_6_months',
  'premium_account',
  'premium_account_3_month',
  'premium_account_3_months',
  'premium_account_6_month',
  'premium_account_6_months',
  '1_free_month_for_social_share',
];

export default function PurchaseModel(app) {
  const { db } = app;
  const dataSchema = new MongooseSchema({
    transactionId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
  }, {
    strict: false,
    timestamps: false,
  });

  const schema = new MongooseSchema({
    userId: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    platform: {
      type: String,
      enum: [
        'ios',
        'android',
        'server',
      ],
      required: true,
    },
    data: {
      type: Object,
    },
    type: {
      type: String,
      default: null,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: null,
    },
    raw: {
      type: Object,
    },
    expiredAt: {
      type: Date,
      default: null,
    },
  }, {
    collection: 'purchase',
    model: 'Purchase',
  });

  schema.methods.getExpirationDate = function () {
    let date = get(this, 'data.expirationDate', null);
    if (date) date = new Date(date);
    return date;
  };

  schema.methods.reinit = function () {
    const productId = get(this, 'data.productId', null);
    if (!productId) return;
    if (subscriptionIds.indexOf(productId) >= 0) {
      if (!this.type) {
        this.type = productId;
        this.isSubscription = true;
        this.expiredAt = this.getExpirationDate();
      }
      if (!this.expiredAt) {
        //eslint-disable-line
      } else {
        this.isActive = this.expiredAt >= new Date();
      }
    } else if (productId === 'buy_1_meeting') {
      if (!this.type) {
        this.type = productId;
        this.isSubscription = false;
        this.isActive = true;
      }
    } else {
      // eslint-disable-line
    }
  };
  schema.methods.recount = async function () {
    const { UserModel } = app.models;
    const { isActive } = this;
    this.reinit();
    if (isActive !== this.isActive) {
      app.emit('purchase.isActiveChange', { purchase: this, userId: this.userId });
      await this.save();
      const user = await UserModel.findById(this.userId);
      await user.updateAccountType();
      await user.save();
    }
    return this;
  };


  schema.statics.recountExpired = async function () {
    const date = new Date();
    const purchases = await this.find({
      isSubscription: true,
      isActive: true,
      expiredAt: { $lt: date },
    });

    return Promise.map(purchases, async (purchase) => {
      // eslint-disable-next-line no-param-reassign
      await purchase.recount();
    });
  };

  return schema;
}
