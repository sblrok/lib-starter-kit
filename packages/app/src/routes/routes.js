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
        throw `Not found: ${path}`;
      },
    },
  ],
};
