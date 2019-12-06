import Api from '@lskjs/server-api';

export default class BaseApi extends Api {
  cache(key, callback) {
    return callback();
  }
}
