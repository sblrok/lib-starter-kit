import UniversalSchema from 'lego-starter-kit/utils/UniversalSchema';
import _ from 'lodash';
import defaultBasic from './limits/basic';
import defaultIsic from './limits/isic';
import defaultPremium from './limits/premium';
export function getSchema(ctx) {
  const schema = new UniversalSchema({
    type: {
      type: String,
      enum: [
        'basic',
        'isic',
        'premium',
      ],
    },
    eventsCountInMonth: {
      type: Number,
      default: 2,
    },
    basicDialogsCountInWeek: {
      type: Number,
      default: 3,
    },
    learningLanguagesCount: {
      type: Number,
      default: 3,
    },
    searchNativeLanguages: {
      type: String,
      default: 'nativeOnly',
      enum: [
        'nativeOnly',
        'all',
      ],
    },
    photosInProfile: {
      type: Number,
      default: 1,
    },
    hideAvatarInMap: {
      type: Boolean,
      default: false,
    },
    searchRadiusLimit: {
      type: Number,
      default: 100,
    },
    noAds: {
      type: Boolean,
      default: true,
    },
    chooseStatus: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true,
  });

  schema.methods.toJSON = function () {
    return _.omit(this.toObject(), ['_id', '__v', 'updatedAt', 'createdAt']);
  };

  schema.statics.getKey = (type) => {
    return `limit_${type}`;
  };

  schema.statics.run = async function () {
    console.log('init');
    let {
      basic,
      isic,
      premium,
    } = await Promise.props({
      basic: this.findOne({ type: 'basic' }),
      isic: this.findOne({ type: 'isic' }),
      premium: this.findOne({ type: 'premium' }),
    });
    if (!basic) {
      basic = new this({ type: 'basic', ...defaultBasic });
      await basic.save();
    }
    if (!isic) {
      isic = new this({ type: 'isic', ...defaultIsic });
      await isic.save();
    }
    if (!premium) {
      premium = new this({ type: 'premium', ...defaultPremium });
      await premium.save();
    }
    return true;
  };

  schema.statics.inMemory = async function () {
    const {
      basic,
      isic,
      premium,
    } = await Promise.props({
      basic: this.findOne({ type: 'basic' }),
      isic: this.findOne({ type: 'isic' }),
      premium: this.findOne({ type: 'premium' }),
    });
    ctx.services.RedisService.set(this.getKey('basic'), basic);
    ctx.services.RedisService.set(this.getKey('isic'), isic);
    ctx.services.RedisService.set(this.getKey('premium'), premium);
  };

  schema.statics.get = async function (type) {
    if (type === 'basic') {
      return this.getBasic();
    } else if (type === 'isic') {
      return this.getIsic();
    } else if (type === 'premium') {
      return this.getPremium();
    }
    return null;
  };

  schema.statics.getBasic = async function () {
    return ctx.services.RedisService.get(this.getKey('basic'));
  };
  schema.statics.getIsic = async function () {
    return ctx.services.RedisService.get(this.getKey('isic'));
  };
  schema.statics.getPremium = async function () {
    return ctx.services.RedisService.get(this.getKey('premium'));
  };

  return schema;
}

export default(ctx) => {
  return ctx.db.model('Limit', getSchema(ctx).getMongooseSchema(), 'limits');
};
