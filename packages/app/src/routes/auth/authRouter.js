import get from 'lodash/get';

export default {
  async action({ next, page }) {
    // if (__SERVER__) return page.loading();
    return page.next(next);
  },
  children: [
    {
      path: '',
      action: ({ page }) => page.redirect('/auth/login'),
    },
    {
      path: '/signup',
      async action({ page, t, uapp, user }) {
        const auth = await uapp.module('auth');
        if (get(user, 'meta.approvedEmail')) return page.redirect('/cabinet');
        const onSubmit = uapp.catchError(async (value) => {
          const { user: newUser } = await auth.signupAndLogin(value);
          uapp.redirect(`/cabinet/users/${newUser._id}`);
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
      async action({ page, t, uapp, user }) {
        const auth = await uapp.module('auth');
        if (get(user, 'meta.approvedEmail')) return page.redirect('/cabinet');
        const onSubmit = uapp.catchError(async (value) => {
          await auth.login(value);
          uapp.redirect('/cabinet');
        });
        const view = 'login';
        return page
          .meta({
            title: t('authPage.signup'),
            url: '/auth/login',
          })
          .component(import('./AuthSigninPage'), { view, onSubmit });
      },
    },
  ],

};
