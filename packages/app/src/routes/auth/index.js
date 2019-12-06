import get from 'lodash/get';

export default {
  async action({ next, page }) {
    if (__SERVER__) return page.loading();
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
        console.log(5656565);
        if (__SERVER__) return page.loading();
        console.log(12312312312312);
        
        const auth = await uapp.module('auth');
        console.log({ auth }, auth.signupAndLogin);

        if (get(user, 'meta.approvedEmail')) return page.redirect('/cabinet');
        const onSubmit = uapp.createOnSubmit(async (value) => {
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
        if (__SERVER__) return page.loading();
        const auth = await uapp.module('auth');
        console.log({ auth }, auth.qwe, auth.signupAndLogin);
        if (get(user, 'meta.approvedEmail')) return page.redirect('/cabinet');
        const onSubmit = uapp.createOnSubmit(async (value) => {
          await auth.login({ email: (value.email).toLowerCase(), password: value.password });
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
