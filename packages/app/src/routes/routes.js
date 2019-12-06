/* eslint-disable global-require */

export default {
  path: '',
  // async action({ next, page }) {
  //   console.log(page);
  //   return page
  //     .layout(MainLayout)
  //     .errorLayout(ErrorLayout)
  //     .next(next);
  // },
  children: [
    {
      path: '',
      action({ page, config = {} }) {
        return page.component(import('./IndexPage'), { about: config.about });
      },
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
        throw `Not found: ${path}`;
      },
    },
  ],
};
