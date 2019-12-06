/* eslint-disable global-require */
import './polyfill';
import ServerApp from '@lskjs/server';
import ready from '@lskjs/utils/polyfill';
import ReactApp from '@lskjs/reactapp';
import sms from '@lskjs/sms';
import BaseHtml from '@lskjs/reactapp/Html';
import NotifyLogger from 'notify-logger';
import map from 'lodash/map';
import get from 'lodash/get';
import pack from './pack';
import Schedule from './Schedule';
import Grant from './Grant';
import PushNotifications from './PushNotifications';
import createWs from './ws';

// import cors from 'cors';
import Uapp from './Uapp';

ready();
process.stdout.write('\x1b[2J');
process.stdout.write('\x1b[0f');

function assets(url) {
  try {
    const str = require('fs').readFileSync(
      `${__dirname}/../public/asset-manifest.json`,
    );
    const json = JSON.parse(str);
    return json[url];
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return null;
  }
}

class Html extends BaseHtml {
  constructor(props) {
    super(props);
    if (!this.head) this.head = '';
    if (!this.footer) this.footer = '';
    this.head = `\
${this.head}
${assets('main.css') ? `<link href='${assets('main.css')}' rel='stylesheet'>` : ''}
`;
    this.footer = `\
${this.footer}
${require('fs')
    .readFileSync(`${__dirname}/../public/footer.html`)
    .toString()}
`;

    //     if (__DEV__) {
    //       this.footer = `\
    // ${this.footer}
    // <script src='http://localhost:3000/static/js/bundle.js'></script>
    // <script src='http://localhost:3000/static/js/0.chunk.js'></script>
    // <script src='http://localhost:3000/static/js/main.chunk.js'></script></body>
    //       `;
    //     }
  }
}

export default class App extends ServerApp {
  getRoutes = require('./api').default;


  grant = new Grant({ app: this });
  pushNotifications = new PushNotifications({ app: this, config: this.config.fcm });
  initEvents = require('./methods/initEvents').default;

  staticDir = `${__dirname}/../public`;
  getStatics() {
    return {
      // ...super.getStatics(),
      ...this.getStaticsDir(this.staticDir),
      '/storage': __DEV__ ? `${__dirname}/../../../storage` : `${__dirname}/public/../../storage`,
      // '/storage': `${__dirname}/../storage`,
      // '/static': `${__dirname}/../public/static`,
      // '/favicon.ico': `${__dirname}/../public/favicon.ico`,
    };
  }
  getModels() {
    return {
      // ...super.getModels(),
      ...require('./models').default(this),
    };
  }
  getResponses() {
    return {
      ...super.getResponses(),
      pack: pack(this),
    };
  }
  getModules() {
    return {
      ...super.getModules(),
      ...require('./modules/server').default(this),
    };
  }
  healthchecks() {
    return {
      nodejs: () => true,
      db: () => this.models.UserModel.findOne({}).select('_id'),
    };
  }
  async getAppStateChats(userId, isNeedMessages) {
    const { ChatModel } = this.models;
    // console.log('before $elemMatch', { userId });
    const chats = await ChatModel.find({ userIds: userId }).select(['read', 'lastActivityAt']);
    const filterChats = chats.filter((chat) => {
      const read = get(chat, `read.${userId}`);
      if (!read) return true;
      const lastActivityAt = get(chat, 'lastActivityAt', new Date());
      return lastActivityAt > read;
    });
    const res = {
      chats: filterChats.length,
    };

    if (isNeedMessages) {
      res.messages = 0;
    } else {
      res.messages = 0;
    }

    return res;
  }

  getAppStateRequests(userId) {
    const { RequestModel } = this.models;
    return RequestModel.count({ toUserId: userId, status: null });
  }

  async getAppState(userId) {
    // const { UserModel, ChatModel } = this.models;
    // ChatModel.find();
    const onbjectUserId = new this.db.Types.ObjectId(userId);
    const { chats, messages } = await this.getAppStateChats(onbjectUserId);
    const requests = await this.getAppStateRequests(onbjectUserId);

    // if (await RequestModel.count({ fromUserId: userId, help }) >= requestsLimit) return false;
    //   return true;
    // }
    // if (action === 'events.create') {
    //   if (user.accountType === 'PREMIUN') return true;
    //   const { EventModel } = this.app.models;
    //   const eventsLimit = get(this, 'app.config.logic.events.limit');
    //   if (!eventsLimit) return true;
    //   if (await EventModel.count({ userId }) >= eventsLimit) return false;

    return {
      notifications: requests + chats,
      unread: {
        requests,
        chats,
        messages,
      },
      limit: {
        requests: 2500,
        requestsDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        events: 999,
        eventsDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };
  }

  async init() {
    await super.init();
    await this.initEvents();
    this.sms = sms(this.config.sms);
    this.logger = new NotifyLogger(this.config.notify);
    // this.logger.trace('bratishka init');
    this.app.enable('trust proxy');
    this.reactApp = new ReactApp({
      Html,
      Uapp,
      config: this.config,
      app: this,
      resolve: this.resolve,
      express: this.express,
    });
    this.schedule = new Schedule(this);
    await this.reactApp.start();
  }
  async run() {
    await super.run();
    const cb = async (socket, socket2) => {
      const { chatId, token } = socket.handshake.query;
      // console.log('socket.handshake', socket.handshake);
      // console.log({ chatId, token });
      const { UserModel } = this.models;
      await new Promise((resolve, reject) => {
        socket.request.token = token;
        this.middlewares.parseUser(socket.request, socket.response, (err, data) => {
          // console.log('socket.request.user', socket.request.user);
          if (err) return reject(err);
          resolve(data);
        });
      });
      // console.log('join', `chats__${chatId}`);
      const chatName = `chats__${chatId}`;
      socket.join(chatName);
      // socket.join('chats');
      // setInterval(() => {
      //   this.ws.of('/api/v5/chats').to(chatName).emit('message', { content: { text: 'Hello World' } });
      // }, 1000);

      socket.on('readAll', async (params) => {
        const req = {
          user: socket.request.user,
          data: {
            ...params,
            _id: chatId,
          },
        };
        await this.readAll(req);
      });
      socket.on('sendMessage', async (params) => {
        // console.log('on sendMessage@@@@');
        const req = {
          user: socket.request.user,
          data: {
            ...params,
            _id: chatId,
          },
        };
        // console.log('prepare sendMessage');
        await this.sendMessage(req);
      });
      socket.on('findLastMessages', async (params) => {
        const req = {
          user: socket.request.user,
          data: {
            ...params,
            _id: chatId,
          },
        };

        console.log('findLastMessages data', req.data);
        const pack = await this.findLastMessages(req);
        console.log('findLastMessages res', JSON.stringify(pack, null, 2));
        socket.emit('lastMessages', pack);
      });
      // await this.ws.atachMiddlwares(socket);
      // console.log('## connection', socket.qwe, socket.data, socket.req);

      // console.log('## connection', socket, socket.data, socket.req);
      // socket.on('ping', (data) => {
      //   console.log('## ping', data);
      //   socket.emit('message', 'pong');
      // });
      // socket.on('event', (data) => {
      //   console.log('## event', data);
      //   socket.emit('message', 'pong');
      // });
      // socket.on('disconnect', () => {
      //   console.log('## disconnect');
      // });
      // setInterval(() => {
      //   socket.emit('message0', 'test');
      // }, 1000);
    };

    const nsp = this.ws.of('/api/v5/chats').on('connection', cb);
    const nsp2 = this.ws.of('/api/v5/events').on('connection', async (socket) => {
      const { token } = socket.handshake.query;
      // const { UserModel } = this.models;
      await new Promise((resolve, reject) => {
        socket.request.token = token;
        this.middlewares.parseUser(socket.request, socket.response, (err, data) => {
          // console.log('socket.request.user', socket.request.user);

          if (err) return reject(err);
          resolve(data);
        });
      });
      const { _id: userId } = socket.request.user;
      // console.log('socket.join', `users__${userId}`);

      socket.join(`users__${userId}`);
    });
    if (this.modules.mailer) {
      this.modules.mailer.theme = {
        colors: {
          primary: 'red',
          secondary: 'blue',
        },
      };
      this.modules.mailer.templates = {
        ...this.modules.mailer.templates,
        authCode: require('./modules/mailer/authCode').default,
      };
    }
  }
}
