import BaseIndexApi from '@lskjs/server-api/IndexApi';
// import BaseApi from '@lskjs/server-api';
import AdminApi from './AdminApi';
// import AuthApi from '@lskjs/auth/server/Api';
import AuthApi from './AuthApi';
import getDocs from './docs';
import UsersMeApi from './UsersMeApi';


export default class IndexApi extends BaseIndexApi {
  models = this.app.models;
  authApi = new AuthApi(this.app);
  adminApi = new AdminApi(this.app);
  usersMeApi = new UsersMeApi(this.app);
  getDocs = getDocs;

  getRoutes() {
    return {
      ...super.getRoutes(),
      '/auth': this.authApi.getRoutes(),
      '/admin': this.adminApi.getRoutes(),
      '/users?/me': this.usersMeApi.getRoutes(),
      '/env': () => ({ // TODO: скопировать из аналитики
        __DEV__,
        __PROD__,
        env: process.env,
      }),
      // TODO: сделать тестовый роут где тестировать всё нахер
      '/err/1': () => {
        throw 'ERROR_CODE';
      },
      '/err/2': () => {
        throw { code: 'ERROR_CODE', message: 'The message text' };
      },
      '/err/3': () => {
        throw this.e('ERROR_CODE', { message: 'The message text' });
      },
      '/err/4': () => {
        throw this.app.errors.e404('ERROR_CODE', { message: 'The message text' });
      },
      '/err/5': () => {
        throw this.app.errors.e404({ code: 'ERROR_CODE', message: 'The message text' });
      },
      '/err/6': () => {
        throw this.app.errors.e404('some error');
      },
      ...this.getDocsRoutes({
        path: '/api',
      }),
      '*': () => { throw this.app.errors.e404('No such API method'); },
    };
  }
}
