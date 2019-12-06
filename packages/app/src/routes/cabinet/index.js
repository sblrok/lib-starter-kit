import get from 'lodash/get';

export default {
  async action({ next, page }) {
    if (__SERVER__) return page.loading();
    return page.next(next);
  },
  children: [
    {
      path: '',
      action: ({ page }) => page.redirect('/cabinet/messages'),
    },
    {
      path: '/messages',
      async action({ page, api, t }) {
        const { data: users } = await api.fetch('/api/v5/users/find/friends', {
          method: 'post',
          data: {
            view: 'tiny',
            filter: {
              description: { $ne: null },
            },
            sort: {
              createdAt: -1,
            },
          },
        });
        const { data: chats } = await api.fetch('/api/v5/chat/find', {
          method: 'post',
          data: {
            view: 'tiny',
            sort: {
              createdAt: -1,
            },
          },
        });
        return page
          .meta({
            title: t('cabinet.messages'),
            url: '/cabinet/messages',
          })
          .component(import('./MessagesPage'), { api, users, chats });
      },
    },
    {
      path: '/requests',
      action({ page, api, t, params }) {
        // console.log({ api, params });
        const { chatId } = params;
        // const { ownerType = 'demo', ownerId = 'demo' } = query;

        return page
          .meta({
            title: t('cabinet.requests'),
            url: '/cabinet/requests',
          })
          .component(import('./RequestsPage'), { api, chatId });
      },
    },
    {
      path: '/chats/:chatId',
      action({ page, api, t, params }) {
        // console.log({ api, params });
        const { chatId } = params;
        // const { ownerType = 'demo', ownerId = 'demo' } = query;

        return page
          .meta({
            title: t('cabinet.chat'),
            url: `/cabinet/chats/${chatId}`,
          })
          .component(import('./ChatPage'), { api, chatId });
      },
    },
    {
      path: '/users',
      async  action({ page, api, t, params }) {
        const { data: users } = await api.fetch('/api/v5/users/find', {
          method: 'post',
          data: {
            view: 'default',
            filter: {
              name: { $ne: null },
              description: { $ne: null },
            },
          },
        });

        return page
          .meta({
            title: t('cabinet.user'),
            url: '/cabinet/users',
          })
          .component(import('./UsersPage'), { api, users });
      },
    },
    {
      path: '/users/:userId',
      async  action({ page, api, t, params }) {
        // console.log({ api, params });
        const { userId } = params;

        const { data: user } = await api.fetch('/api/v5/users/findOne', {
          method: 'post',
          data: {
            _id: userId,
            view: 'default',
          },
        });

        return page
          .meta({
            title: t('cabinet.user'),
            url: `/cabinet/users/${userId}`,
          })
          .component(import('./UserPage'), { api, userId, user });
      },
    },
  ],
};
