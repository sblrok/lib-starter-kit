
export default {
  path: '',
  children: [
    {
      path: '',
      async action({ page, config = {}, grant }) {

        console.log('grant.cabinet', await grant.can('cabinet'));
        console.log('grant.access', await grant.can('cabinet.access'));
        
        return page.component(import('./HomeIndexPage'), { about: config.about });
      },
    },
    {
      path: '/about',
      action({ page, config = {} }) {
        return page.component(import('./HomeAboutPage'), { about: config.about });
      },
    },
  ],
};
