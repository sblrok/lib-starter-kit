import Api from '@lskjs/server-api';
import isPlainObject from 'lodash/isPlainObject';

export default class GrantApi extends Api {
  getRoutes() {
    return {
      '/can': ::this.can,
    };
  }
  async can(req) {
    const userId = req.user && req.user._id;
    const { data } = req;
    if (!this.app.grant) throw '!app.grant';
    if (!isPlainObject(data)) throw 'data is not object';
    if (data.userId && data.userId !== userId) {
      console.log('ALARMAAAAAA ALARMAAAAAAALARMAAAAAAALARMAAAAAA -- userId is changed');
    }
    const res = await this.app.grant.can({
      ...data,
      userId,
    });
    return res;
  }
}
