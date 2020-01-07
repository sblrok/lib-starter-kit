export default {
  async action({ next, page }) {
    if (__SERVER__) return page.loading();
    return page.next(next);
  },
  children: [
    {
      path: '',
      action: ({ page }) => page.redirect('/cabinet/users'),
    },
    {
      path: '/users',
      async action({ page, i18 }) {
        return page
          .meta({
            title: i18.t('pages.users.title'),
            url: '/cabinet/users/',
          })
          // .component(import('../../pages/UsersPage'), { });
          .component(import('../../pages/UserListPage'), { });
      },
    },
    {
      path: '/users/:id',
      async action({ page, i18, params }) {
        const { _id } = params;
        return page
          .meta({
            title: i18.t('pages.user.title'),
            url: `/cabinet/users/${_id}`,
          })
          .component(import('../../pages/UserPage'), { });
      },
    },
  ],
};


