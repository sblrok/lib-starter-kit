
export default {
  path: '',
  children: [
    {
      path: '',
      action({ page, config = {} }) {
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
