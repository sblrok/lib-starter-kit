import Accountkit from 'node-accountkit';
// import random from 'lodash/random';
import Api from './BaseApi';

const trimPhone = (str = '') => String(str).replace(/[^0-9]/gi, '');
const trimEmail = (str = '') => String(str).toLowerCase().trim();


export default class AuthApi extends Api {
  getRoutes() {
    return {
      '/test': ::this.test,
      '/accountkit': ::this.accountkit,
      '/passports/detach': ::this.passportsDetach,
      '/facebook': ::this.facebook,
      '/social': ::this.social,
      // '/vkontakte': ::this.vkontakte,
      '/phone': ::this.phoneOrEmail,
      '/email': ::this.phoneOrEmail,
      '/confirm': ::this.confirm,
      '/status': ::this.status,
      '/check': ::this.check,
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
  async accountkit(req, res) {
    const { debug } = req.data;
    const { accountkit } = this.app.config.auth.providers;
    const { appId, appSecret, apiVersion, requireAppSecret } = accountkit;
    const csrf = 'qwertyui';

    if (debug) {
      return res.send(`
<script src="https://sdk.accountkit.com/en_US/sdk.js"></script>

<input value="+7" id="country_code" />
<input placeholder="phone number" id="phone_number" value="9178292237"/>
<button onclick="smsLogin();">Login via SMS</button>
<div>OR</div>
<input placeholder="email" id="email"/>
<button onclick="emailLogin();">Login via Email</button>



<script>
  // initialize Account Kit with CSRF protection
  AccountKit_OnInteractive = function(){
    AccountKit.init(
      {
        appId:"${appId}", 
        state:"${csrf}", 
        version:"${apiVersion}",
        fbAppEventsEnabled:true,
        redirect:"http://localhost:8080/api/v5/auth/accountkit"
      }
    );
  };

  // login callback
  function loginCallback(response) {
    console.log('response', response);
    if (response.status === "PARTIALLY_AUTHENTICATED") {
      var code = response.code;
      var csrf = response.state;
     window.location='/api/v5/auth/accountkit?csrf=${csrf}&access_token=' + response.code;
      // Send code to server to exchange for access token
    }
    else if (response.status === "NOT_AUTHENTICATED") {
      // handle authentication failure
    }
    else if (response.status === "BAD_PARAMS") {
      // handle bad parameters
    }
  }

  // phone form submission handler
  function smsLogin() {
    var countryCode = document.getElementById("country_code").value;
    var phoneNumber = document.getElementById("phone_number").value;
    AccountKit.login(
      'PHONE', 
      {countryCode: countryCode, phoneNumber: phoneNumber}, // will use default values if not specified
      loginCallback
    );
  }


  // email form submission handler
  function emailLogin() {
    var emailAddress = document.getElementById("email").value;
    AccountKit.login(
      'EMAIL',
      {emailAddress: emailAddress},
      loginCallback
    );
  }
</script>
      `);
    }

    const { UserModel } = this.app.models;
    // eslint-disable-next-line camelcase
    const { access_token } = req.data;
    Accountkit.set(appId, appSecret, apiVersion);
    Accountkit.requireAppSecret(requireAppSecret);

    const data = await new Promise((resolve, reject) => {
      Accountkit.getAccountInfo(access_token, (err, resp) => {
        if (err) return reject(err);
        return resolve(resp);
      });
    });
    const phone = trimPhone(data.phone.number);

    const provider = 'phone';
    const params = { phone };
    const operation = await this.getOperation(req, { provider, params });

    let user;
    if (operation === 'signup') {
      user = new UserModel(params);
      user.editedAt = new Date();
      user.signinAt = new Date();
    } else if (operation === 'login') {
      user = await UserModel.findOne(params);
      if (!user) throw '!user';
      user.signinAt = new Date();
    } else if (operation === 'attach') {
      if (!req.user) throw '!user';
      user = await UserModel.findById(req.user._id);
      if (!user) throw '!user';
      user.phone = phone;
      user.editedAt = new Date();
      const user2 = await UserModel.findOne(params);
      if (user2) throw 'HAS_BEEN_ATTACHED';
    } else {
      throw '!operation';
    }
    await user.save();
    const token = user.generateAuthToken();
    console.log(`auth/accountkit ${user._id} ${token}`); // this.app.logger
    return {
      isNew: operation === 'signup',
      operation,
      token,
      status: await user.getStatus(),
      user: await UserModel.prepare(user, { req, view: 'extended' }),
    };
  }


  async passportsDetach(req) {
    await this.isAuth(req);
    const { PassportModel } = this.app.models;
    const { _id } = req.data;
    const passport = await PassportModel.findById(_id);
    if (String(passport.userId) !== String(req.user._id)) throw '!acl';
    await PassportModel.deleteOne({ _id: passport._id });
    // await passport.remove();
    return { ok: 1 };
  }

  async facebook(req) {
    req.data.provider = 'facebook';
    console.log('facebook', req.data);

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
    console.log(`auth/social ${user._id} ${token}`); // this.app.logger
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

  async phoneOrEmail(req) {
    const params = {};
    let provider;
    let value;
    if (req.data.phone) {
      provider = 'phone';
      value = trimPhone(req.data.phone);
      params.phone = value;
    } else if (req.data.email) {
      provider = 'email';
      value = trimEmail(req.data.email);
      params.email = req.data.email;
    } else {
      throw 'EMPTY_PHONE_OR_EMAIL';
    }

    const { PermitModel } = this.app.models;
    const operation = await this.getOperation(req, { provider, params });

    // me@coder24.ru => 1234
    // me@coder242.ru => 1234

    // const date = new Date();
    // const str = `${email}_${+date}`;
    // const str = Math.random();
    const length = provider === 'email' ? 6 : 4;
    const code = await PermitModel.generateUniqCode({
      codeParams: {
        type: 'number',
        length,
      },
      criteria: {
        type: 'auth',
        info: {
          provider,
          ...params,
        },
      },
    });
    const permit = await PermitModel.createPermit({
      expiredAt: PermitModel.makeExpiredAt({
        value: 30,
        type: 'day',
      }),
      type: 'auth',
      userId: req.user && req.user._id,
      info: {
        provider,
        ...params,
      },
      code,
    });

    const link = this.app.url(`/auth/permit/${permit._id}?code=${permit.code}`);

    this.app.emit('events.permit.auth', {
      permit,
      operation,
      link,
      code,
    });

    // });

    const res = {
      permitId: permit._id,
    };

    if (__DEV__) {
      res.permit = permit; // await PermitModel.prepare(permit, { req });
    }

    return res;
    // @TODO: INCIRCLE => email or phone code =>
  }

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

  async confirm(req) {
    const { code, permitId } = req.data;
    const { UserModel, PermitModel } = this.app.models;
    if (!code) throw '!code';
    // const permit = await PermitModel.findById(permitId);
    // if (!permit) throw this.e(404, 'Permit not found!');

    const permit = await PermitModel.findByCode(code, {
      _id: permitId,
      type: 'auth',
    });

    if (!permit) throw 'invalidCode';
    const { provider } = permit.info;
    if (!provider) throw '!provider';

    if (!permit.info[provider]) throw '!permit.info[provider]';
    const params = {
      [provider]: permit.info[provider],
    };

    const operation = await this.getOperation(req, { provider, params });

    let user;
    if (operation === 'signup') {
      user = new UserModel(params);
      user.editedAt = new Date();
      user.signinAt = new Date();
    } else if (operation === 'login') {
      user = await UserModel.findOne(params).sort({ createdAt: 1 });
      if (!user) throw '!user';
      user.signinAt = new Date();
    } else if (operation === 'attach') {
      if (!req.user) throw '!user';
      user = await UserModel.findById(req.user._id);
      if (!user) throw '!user';
      user[provider] = permit.info[provider];
      user.editedAt = new Date();
      const user2 = await UserModel.findOne(params);
      if (user2) throw 'HAS_BEEN_ATTACHED';
    } else {
      throw '!operation';
    }

    await permit.activate();
    await user.save();
    const token = user.generateAuthToken();
    console.log(`auth/confirm ${user._id} ${token}`); // this.app.logger
    return {
      isNew: operation === 'signup',
      operation,
      token,
      status: await user.getStatus(),
      user: await UserModel.prepare(user, { req, view: 'extended' }),
    };
  }
  async status(req) {
    await this.isAuth(req);
    const { _id } = req.user;
    const { UserModel } = this.app.models;
    const user = await UserModel.findOne({ _id });
    if (!user) throw this.e(404, 'User not found!');
    const token = user.generateAuthToken();
    console.log(`auth/status ${user._id} ${token}`); // this.app.logger
    return {
      api: {
        v: 5,
        isExpired: false,
        actualApi: '/api/v5',
        ios: {
          id: 1071097131,
          slug: 'hi-jay-native-speakers-nearby',
          url: 'https://apps.apple.com/us/app/hi-jay-native-speakers-nearby/id1071097131',
        },
        android: {
          id: 'com.hijay.hijay',
          url: 'https://play.google.com/store/apps/details?id=com.hijay.hijay',
        },
      },
      state: await this.app.getAppState(_id),
      token,
      status: await user.getStatus(),
      user: await UserModel.prepare(user, { req, view: 'extended' }),
    };
  }
  async check(req) {
    const criteria = {};
    if (req.data.phone) {
      criteria.phone = trimPhone(req.data.phone);
    }
    if (req.data.email) {
      criteria.email = trimEmail(req.data.email);
    }
    if (!Object.keys(criteria)) throw 'email or phone required';
    const { UserModel } = this.app.models;
    const user = await UserModel.findOne(criteria).select('_id');
    return {
      exists: !!user,
    };
  }
}
