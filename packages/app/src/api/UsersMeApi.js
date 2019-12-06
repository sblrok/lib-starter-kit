import Api from './BaseApi';

export default class UsersMeApi extends Api {
  getRoutes() {
    return {
      '/': ::this.getProfile,
      '/setProfile': ::this.setProfile,
      '/setCoordinates': ::this.setCoordinates,
    };
  }
  assign(model, params, fields) {
    if (!fields) {
      fields = [
        'name',
        'description',
        'bdate',
        'gender',
        'nativeLanguages',
        'learningLanguages',
        'desciption',
        'photos',
        'city',
        '_city',
      ];
    }
    return super.assign(model, params, fields);
  }
  async setCoordinates(req) {
    await this.isAuth(req);
    const { UserModel } = this.app.models;
    const user = await UserModel.findById(req.user._id);
    if (!user) throw '!user';
    const { lat, lng } = req.data;
    await UserModel.updateOne({ _id: req.user._id }, {
      $set: {
        loc: [lng, lat],
      },
    });
    user.loc = [lng, lat];
    return UserModel.prepare(user, { req, view: 'extended' });
  }
  async getProfile(req) {
    await this.isAuth(req);
    const { UserModel } = this.app.models;
    const user = await UserModel.findById(req.user._id);
    await user.updateAccountType();
    await user.save();
    return UserModel.prepare(user, { req, view: 'extended' });
  }
  async setProfile(req) {
    await this.isAuth(req);
    const { UserModel } = this.app.models;
    const user = await UserModel.findById(req.user._id);
    // console.log('req.data', req.data);
    const { data } = req;
    if (data.bdate) {
      data.bdate = new Date(data.bdate);
    }
    if (data._city) {
      data._city = data._city;
      data.city = data._city.title;
    } else {
      delete data.city;
      delete data._city;
    }
    if (data.options) {
      user.options = {
        ...(user.options || {}),
        ...data.options,
      };
    }
    this.assign(user, data);
    // console.log('user', user);

    await user.save();
    return UserModel.prepare(user, { req, view: 'extended' });
  }


  params(req, fields) {
    fields.forEach((field) => {
      if (req.data[field] == null) {
        throw this.e(400, `Поле ${field} не передано`);
      }
    });
  }
}
