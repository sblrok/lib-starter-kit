/* eslint-disable global-require */
import Err from '@lskjs/utils/Err';

export default {
  path: '',
  async action({ next, page }) {
    return page.next(next).catch(err => page.component(import('./ErrorPage'), { err }));
  },
  children: [
    {
      path: '',
      ...require('./home').default,
    },
    {
      path: '/auth',
      ...require('./auth').default,
    },
    {
      path: '/cabinet',
      ...require('./cabinet').default,
    },
    {
      path: '(.*)',
      action({ path }) {
        throw new Err('E_404', {
          message: `Not found path ${path}`,
          path,
        });
      },
    },
  ],
};
