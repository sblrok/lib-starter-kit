import Api from './BaseApi';

export default class AuthApi extends Api {
  getRoutes() {
    return {
      ...super.getRoutes(),
      // '/test': ::this.test,
      // '/facebook': ::this.facebook,
      // '/social': ::this.social,
      // '/vkontakte': ::this.vkontakte,
      // '/phone': ::this.phoneOrEmail,
      // '/email': ::this.phoneOrEmail,
      // '/confirm': ::this.confirm,
    };
  }

  async test(req, res) {
    const params = {
      to: 'me@coder24.ru',
      template: 'authCode',
      props: {
        code: 123456,
        link: 'https://mail.yandex.ru/?pdd_domain=coder24.ru&uid=1130000002365683#inbox',
      },
    };
    const options = this.app.modules.mailer.renderTemplate(params);

    return res.send(options.html);
    // await this.app.modules.mailer.send(params);
  }

  async facebook(req) {
    req.data.provider = 'facebook';
    return this.social(req);
    // const { access_token } = req.data;

    // const { UserModel } = this.app.models;
    // const user = await UserModel.findOne({ });
    // if (!user) throw this.e(404, 'User not found!');
    // // const { companyId } = req.data;
    // // await user.updatePosition({ companyId });
    // // await user.save();

    // const isNew = false;
    // const token = user.generateAuthToken();

    // return {
    //   user: await UserModel.prepare(user),
    //   token,
    //   isNew,
    // };
  }

  async social(req) {
    // eslint-disable-next-line camelcase
    const { provider, access_token } = req.data;

    const { auth } = this.app.modules;
    const { PassportModel, UserModel } = this.app.models;

    if (!['facebook', 'vkontakte'].includes(provider)) throw '!provider';
    const Strategy = auth.strategies[provider];
    if (!Strategy) throw '!provider.Strategy';
    const res = await Strategy.checkToken(access_token);
    if (!res) throw this.app.errors.e400('Wrong access_token');
    const { providerId } = res;
    let passport = await PassportModel.findOne({
      provider,
      providerId,
    });
    if (passport) {
      if (passport.blocked) {
        // this.app.errors.e403
        throw this.app.e({
          code: 'E_PROFILE_BLOCKED',
          message: 'This profile has been blocked',
        });
      }
      // if (passport.userId) {
      //   throw this.app.errors.e400('Profile already registered');
      // }
    } else {
      passport = new PassportModel({
        provider,
        providerId,
        token: access_token,
      });
    }

    let params;
    if (passport.userId) {
      params = { _id: passport.userId };
    }
    // console.log(this.app.modules.auth.strategyProviders.facebook);
    const authModule = this.app.modules.auth;
    await authModule.updatePassportData(passport);
    // const params = { userId: passport && passport.userId };
    const operation = await this.getOperation(req, { provider, params });
    let user;
    if (operation === 'signup') {
      user = new UserModel({});
      user.editedAt = new Date();
      user.signinAt = new Date();
      await user.save();
    } else if (operation === 'login') {
      user = await UserModel.findOne(params);
      if (!user) throw '!user';
      user.signinAt = new Date();
      await user.save();
    } else if (operation === 'attach') {
      if (!req.user) throw '!user';
      user = await UserModel.findById(req.user._id);
      if (!user) throw '!user';
    } else {
      throw '!operation';
    }
    if (operation === 'signup' || operation === 'attach') {
      passport.userId = user._id;
      await passport.save();
    }

    passport.userId = user._id;
    await passport.save();

    if (!user) throw '!user';
    const token = user.generateAuthToken();
    // console.log(`auth/social ${user._id} ${token}`); // this.app.logger
    return {
      isNew: operation === 'signup',
      operation,
      token,
      status: await user.getStatus(),
      user: await UserModel.prepare(user, { req, view: 'extended' }),
    };
  }


  async getOperation(req, { provider, params } = {}) {
    let me = req.user;
    const { UserModel } = this.app.models;
    let user;
    if (params) {
      user = await UserModel.findOne(params);
    }
    let operation;
    if (me && me._id) {
      me = await UserModel.findById(me._id);
      if (user) {
        if (provider === 'email') {
          throw 'EMAIL_HAS_BEEN_ATTACHED';
        } else if (provider === 'phone') {
          throw 'PHONE_HAS_BEEN_ATTACHED';
        } else {
          throw 'PROVIDER_HAS_BEEN_ATTACHED';
        }
      } else {
        operation = 'attach';
      }
    } else {
      me = null;
      if (user) {
        operation = 'login';
      } else {
        operation = 'signup';
      }
    }
    return operation;
  }

  // async phoneOrEmail(req) {
  //   const params = {};
  //   let provider;
  //   let value;
  //   if (req.data.phone) {
  //     provider = 'phone';
  //     value = trimPhone(req.data.phone);
  //     params.phone = value;
  //   } else if (req.data.email) {
  //     provider = 'email';
  //     value = trimEmail(req.data.email);
  //     params.email = req.data.email;
  //   } else {
  //     throw 'EMPTY_PHONE_OR_EMAIL';
  //   }

  //   const { PermitModel } = this.app.models;
  //   const operation = await this.getOperation(req, { provider, params });

  //   // me@coder24.ru => 1234
  //   // me@coder242.ru => 1234

  //   // const date = new Date();
  //   // const str = `${email}_${+date}`;
  //   // const str = Math.random();
  //   const length = provider === 'email' ? 6 : 4;
  //   const code = await PermitModel.generateUniqCode({
  //     codeParams: {
  //       type: 'number',
  //       length,
  //     },
  //     criteria: {
  //       type: 'auth',
  //       info: {
  //         provider,
  //         ...params,
  //       },
  //     },
  //   });
  //   const permit = await PermitModel.createPermit({
  //     expiredAt: PermitModel.makeExpiredAt({
  //       value: 30,
  //       type: 'day',
  //     }),
  //     type: 'auth',
  //     userId: req.user && req.user._id,
  //     info: {
  //       provider,
  //       ...params,
  //     },
  //     code,
  //   });

  //   const link = this.app.url(`/auth/permit/${permit._id}?code=${permit.code}`);

  //   this.app.emit('events.permit.auth', {
  //     permit,
  //     operation,
  //     link,
  //     code,
  //   });

  //   // });

  //   const res = {
  //     permitId: permit._id,
  //   };

  //   if (__DEV__) {
  //     res.permit = permit; // await PermitModel.prepare(permit, { req });
  //   }

  //   return res;
  //   // @TODO: INCIRCLE => email or phone code =>
  // }

  // async confirmEmail(req) {
  //   if (!user) throw '!user';
  //   const emailExist = await UserModel
  //     .findOne({
  //       _id: {
  //         $ne: user._id,
  //       },
  //       email: permit.info.email,
  //     })
  //     .select([
  //       'email',
  //     ]);
  //   if (emailExist) {
  //     throw 'emailExist';
  //   }
  //   if (user.email && permit.info.oldEmail && user.email !== permit.info.oldEmail) {
  //     throw 'emailWasChanged';
  //   }
  //   await permit.activate();
  //   user.email = permit.info.email;
  //   unset(user, 'private.info.emailPermitId');
  //   unset(user, 'private.info.email');
  //   user.markModified('private.info');
  //   set(user, 'private.lastUpdates.email', date);
  //   user.markModified('private.lastUpdates.email');
  //   if (!user.meta.approvedEmail) {
  //     user.meta.approvedEmail = true;
  //     user.markModified('meta.approvedEmail');
  //   }
  //   await user.save();
  //   const permits = await PermitModel.find({
  //     _id: { $ne: permit._id },
  //     type: permit.type,
  //     userId: user._id,
  //   });
  //   await Promise.map(permits, (p) => {
  //     p.disabledAt = date; // eslint-disable-line no-param-reassign
  //     return p.save();
  //   });
  //   return permit;
  // }
}
