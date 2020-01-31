/* eslint-disable global-require */
import ServerApp from '@lskjs/server';
import ready from '@lskjs/utils/polyfill';
import ReactApp from '@lskjs/reactapp';
import BaseHtml from '@lskjs/reactapp/Html';
import NotifyLogger from 'notify-logger';
import get from 'lodash/get';
import Grant from '@lskjs/uapp/Grant';

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
  grant = new Grant({ app: this, rules: this.getGrantRules() });
  getRoutes = require('./api').default;
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
  getGrantRules() {
    return require('./grantRules');
  }
  getModels() {
    return {
      // ...super.getModels(),
      ...require('./models').default(this),
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
    await this.reactApp.start();
  }
}
