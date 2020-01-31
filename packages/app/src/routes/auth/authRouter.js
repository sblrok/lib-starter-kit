import get from 'lodash/get';

export default {
  async action({ next, page, t }) {
    return page
      .meta({
        title: t('authPage.page'),
        url: '/auth',
      })
      .next(next);
  },
  children: [
    {
      path: '',
      action: ({ page }) => page.redirect('/auth/login'),
    },
    {
      path: '/signup',
      async action({ page, t, uapp, grant }) {
        const auth = await uapp.module('auth');
        if (await grant.can('cabinet.access')) return page.redirect('/cabinet');
        const onSubmit = uapp.catchError(async (value) => {
          const { user } = await auth.signupAndLogin(value);
          uapp.redirect(`/cabinet/users/${user._id}`);
        });
        const view = 'signup';
        return page
          .meta({
            title: t('authPage.signup'),
            url: '/auth/signup',
          })
          .component(import('./AuthSignupPage'), { view, onSubmit });
      },
    },
    {
      path: '/login',
      async action({ page, t, uapp, grant }) {
        const auth = await uapp.module('auth');
        if (await grant.can('cabinet.access')) return page.redirect('/cabinet');
        const onSubmit = uapp.catchError(async (value) => {
          await auth.login(value);
          uapp.redirect('/cabinet');
        });
        const view = 'login';
        return page
          .meta({
            title: t('authPage.login'),
            url: '/auth/login',
          })
          .component(import('./AuthLoginPage'), { view, onSubmit });
      },
    },
    {
      path: '/logout',
      async action({ page, t, uapp }) {
        const auth = await uapp.module('auth');
        // console.log('logout', auth.logout());
        setTimeout(() => {
          auth.logout();
          console.log('logout');
        }, 1000);


        return page
          .meta({
            title: t('authPage.logout'),
            url: '/auth/logout',
          })
          .component(import('./AuthLogoutPage'));
      },
    },
  ],

};
