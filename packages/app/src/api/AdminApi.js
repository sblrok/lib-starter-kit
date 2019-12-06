/* global __STAGE__ */
import Api from '@lskjs/server-api';

export default class AdmindApi extends Api {
  getRoutes() {
    return {
      '/': () => ({ ok: 321 }),
      '/test': () => 'test',
      '/push/test': ::this.pushTest,
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
