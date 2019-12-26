// import sharp from 'sharp';
import fs from 'fs';
import MongooseSchema from '@lskjs/db/MongooseSchema';
import getFileExtension from '@lskjs/utils/getFileExtension';
import getFileWithoutExtension from '@lskjs/utils/getFileWithoutExtension';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import mapValues from 'lodash/mapValues';

export default function ImageModel(app) {
  const { db: { Schema } } = app;
  const infoSchema = new Schema({
    mimetype: {
      type: String,
      default: null,
    },
    size: {
      type: Number,
      default: null,
    },
    ts: {
      type: Number,
      required: true,
    },
    ext: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
    },
    default: {},
  }, {
    strict: false,
    timestamps: false,
  });

  const schema = new MongooseSchema({
    subjectId: {
      type: String,
      default: null,
      // index: true,
    },
    subjectType: {
      type: String,
      default: null,
      // index: true,
    },
    path: {
      type: String,
      required: true,
    },
    info: infoSchema,
  }, {
    model: 'Image',
    collection: 'image',
  });


  schema.statics.prepareOne = async function (obj) {
    const obj2 = omit(obj.toObject(), ['private']);
    obj2.urls = obj.getUrls();
    obj2.url = obj2.urls.original;
    return pick(obj2, ['_id', 'url', 'urls', __DEV__ ? 'info' : '']);
    // return obj2;
  };


  schema.pre('validate', function (next) {
    if (!this.info) this.info = {};
    this.info.ts = Date.now();
    this.info.ext = getFileExtension(this.path);
    this.info.folder = this.path.replace(/[^\/]*$/, '');
    try {
      this.info.filename = this.path.split('/').pop().split('.')[0]; // eslint-disable-line prefer-destructuring
    } catch (err) {
      return next(err);
    }
    return next();
  });


  schema.statics.sizes = {
    small: [75, 75],
    medium: [240, 240],
    big: [1024, 1024],
    portrait: [1242, 1580],
    original: [1242, 1580],
  };
  schema.methods.getUrls = function () {
    // const url = new Date(this.createdAt) < new Date('2019-07-01') ? app.urlProd : app.url;
    const { url } = app;
    const paths = mapValues(schema.statics.sizes, (v, key) => this.getPath(key));
    // return mapValues(paths, prepath => url(prepath))
    return mapValues(paths, (prepath) => {
      const path = `${process.cwd()}${prepath}`;
      let preurl;
      const { fallbackUrl } = app.config;
      if (fs.existsSync(path) || fallbackUrl) {
        preurl = url(prepath);
      }
      // else if (fallbackUrl) {
      //   preurl = fallbackUrl + prepath;
      // }
      if (preurl) return preurl;
      return app.url('/static/default-avatar.png');
    });
  };

  schema.methods.getPath = function (type) {
    const { ext, folder, filename } = this.info;
    if (type === 'small') return [`${folder}${filename}_s`, ext].join('.');
    if (type === 'medium') return [`${folder}${filename}_m`, ext].join('.');
    if (type === 'big') return [`${folder}${filename}_b`, ext].join('.');
    if (type === 'portrait') return [`${folder}${filename}_p`, ext].join('.');
    if (type === 'original') return [`${folder}${filename}`, ext].join('.');
    return [`${folder}${filename}`, ext].join('.');
  };

  schema.methods.removeFiles = function () {
    return Promise.all([
      this.removeFile(this.getPath('small')),
      this.removeFile(this.getPath('medium')),
      this.removeFile(this.getPath('big')),
      this.removeFile(this.getPath('portrait')),
      this.removeFile(this.getPath('original')),
    ]);
  };

  schema.methods.removeFile = function (prepath) {
    const path = `${process.cwd()}${prepath}`;
    if (fs.existsSync(path)) {
      return fs.unlinkSync(path);
    }
    return null;
  };

  schema.methods.recount = async function () {
    if (this.info.ext === 'null') {
      const filePath = getFileWithoutExtension(this.path);
      const fileFrom = `${process.cwd()}${this.path}`;
      const fileTo = `${process.cwd()}${[`${filePath}`, 'jpg'].join('.')}`;

      console.log(this.path);
      console.log(filePath);
      console.log(fileFrom);

      await fs.renameSync(fileFrom, fileTo);
      this.info.ext = 'jpg';
      this.markModified('info.ext');
      await this.save();
    }
    await this.saveResizedImages();
  };

  schema.methods.saveResizedImages = async function (path = this.path) {
    try {
      const fileExt = getFileExtension(path) || 'jpg';
      const filePath = getFileWithoutExtension(path);
      const fullPath = `${process.cwd()}${path.split('?ts')[0]}`;
      if (!fs.existsSync(fullPath)) {
        if (__DEV__) console.log('!fs.existsSync', fullPath);
        return null;
      }
      const file = suffix => `${process.cwd()}/${[`${filePath}${suffix}`, fileExt].join('.')}`;
      const tasks = [];
      const resizeParams = {
        // fit: 'inside',
        // fit: 'contain',
        fit: 'cover',
      };
      if (__DEV__) console.log(fullPath, ' =>', file('_s'));
      tasks.push(() => (
        sharp(fullPath)
          .resize(75, 75, resizeParams)
          .jpeg({ quality: 60, progressive: true })
          .toFile(file('_s'))
      ));
      tasks.push(() => (
        sharp(fullPath)
          .resize(240, 240, resizeParams)
          .jpeg({ quality: 60, progressive: true })
          .toFile(file('_m'))
      ));
      tasks.push(() => (
        sharp(fullPath)
          .resize(1024, 1024, resizeParams)
          .jpeg({ quality: 80, progressive: true })
          .toFile(file('_b'))
      ));
      tasks.push(() => (
        sharp(fullPath)
          .resize(1242, 1580, resizeParams)
          .jpeg({ quality: 80, progressive: true })
          .toFile(file('_p'))
      ));

      return Promise.all(tasks.map(task => task()));
    } catch (err) {
      if (__DEV__) throw err;
      console.error('Image.saveResizedImages', err);
      return null;
    }
  };


  return schema;
}
