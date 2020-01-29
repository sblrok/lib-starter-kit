import BaseIndexApi from '@lskjs/server-api/IndexApi';
// import BaseApi from '@lskjs/server-api';
import AdminApi from './AdminApi';
// import AuthApi from '@lskjs/auth/server/Api';
import AuthApi from './AuthApi';
import TestApi from './TestApi';
import getDocs from './docs';
import UsersMeApi from './UsersMeApi';


export default class IndexApi extends BaseIndexApi {
  models = this.app.models;
  testApi = new TestApi(this.app);
  authApi = new AuthApi(this.app);
  adminApi = new AdminApi(this.app);
  usersMeApi = new UsersMeApi(this.app);
  getDocs = getDocs;

  getRoutes() {
    return {
      ...super.getRoutes(),
      '/auth': this.authApi.getRoutes(),
      '/test': this.testApi.getRoutes(),
      '/admin': this.adminApi.getRoutes(),
      '/users?/me': this.usersMeApi.getRoutes(),
      '/env': () => ({ // TODO: скопировать из аналитики
        __DEV__,
        env: process.env,
      }),
      // TODO: сделать тестовый роут где тестировать всё нахер
      ...this.getDocsRoutes({
        path: '/api',
      }),
      '*': () => {
        throw this.app.e('E_404');
      },
    };
  }
}
