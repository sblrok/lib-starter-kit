/* eslint-disable global-require */
/* global __STAGE__ */
import errMerge from '@lskjs/utils/errMerge';
import e from '@lskjs/utils/e';
import Err from '@lskjs/utils/Err';
import Api from './BaseApi';

export default class TestApi extends Api {
  getRoutes() {
    return {
      '/res/1': () => 123,
      '/res/2': () => 'Hello',
      '/res/3': () => () => {},
      '/res/4': () => new Error('Test'),
      '/res/5': () => ({ test: 123 }),
      '/res/6': () => ([1, 2, 3, 4]),
      '/err/1': () => {
        throw 'ERROR_CODE';
      },
      '/err/2': () => {
        throw { code: 'ERROR_CODE', message: 'The message text' };
      },
      '/err/3': () => {
        throw this.app.e('ERROR_CODE', { message: 'The message text' });
      },
      '/err/4': () => {
        throw this.app.e('ERROR_CODE', { message: 'The message text' }, { status: 404 });
      },
      '/err/5': () => {
        throw this.app.e({ code: 'ERROR_CODE', message: 'The message text' }, { status: 404 });
      },
      '/err/6': () => {
        throw this.app.e('some error', { status: 404 });
      },
      '/err/7': () => {
        throw new Error('err', 'file', 123);
      },
      '/err/8': () => {
        throw errMerge({ code: 'ERROR_CODE', message: 'The message text' }, { status: 404 });
      },
      '/err/9': () => {
        throw e({ code: 'ERROR_CODE', message: 'The message text' }, { status: 404 });
      },
      '/err/10': () => {
        throw new Err({ code: 'ERROR_CODE', message: 'The message text' }, { status: 404 });
      },
    };
  }

  async pushTest(req) {
    await this.isAuth(req);
    const userId = req.user._id;

    if (__STAGE__ === 'master') throw '__STAGE__ === master';
    const { UserModel } = this.app.models;
    const user = await UserModel.findById(userId);

    this.app.notify.push(user);
  }
}
