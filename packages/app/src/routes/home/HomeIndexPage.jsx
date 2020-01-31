import React from 'react';
import A from '@lskjs/ui/A';
import Slide from '@lskjs/ui/Slide';
import Link from '@lskjs/ui/Link';
import Button from '@lskjs/button';
import Page from '~/lskjs/ui/Page';

export default ({ about = {} }) => (
  <Page>
    <Slide
      full
      overlay
      style={{
        color: '#fff',
      }}
    >
      <div>
        <Page.Header />
        <h1>{about.title}</h1>
        <p>{about.description}</p>
        <p>{__DEV__ ? 'DEV' : '?'}</p>
        <Button
          componentClass={Link}
          href="/cabinet"
        >
          Cabinet
        </Button>
      </div>
    </Slide>
    <Slide
      full
      overlay
      style={{
        color: '#fff',
      }}
    >
      <div>
        <h2>Лендинг</h2>
        <p><A href="/"> Главная</A></p>
        <p><A href="/about"> О проекте</A></p>

        <hr />
        <h2>Авторизация</h2>
        <p><A href="/auth"> авторизация</A></p>

        <h2>Кабинет</h2>
        <p><A href="/cabinet"> Кабинет</A></p>

        <p><A href="/cabinet/profile"> ProfilePage.jsx</A></p>
        <p><A href="/cabinet/users/1/edit"> UserEditPage.jsx</A></p>
        <p><A href="/cabinet/settings"> SettingsPage.jsx</A></p>

        <p><A href="/cabinet/users"> UsersPage.jsx // список?</A></p>
        <p><A href="/cabinet/users/1"> UserPage.jsx // Открытая Карточка</A></p>
        <p><A href="/cabinet/users/search"> UsersSearchPage.jsx // Свайпалка</A></p>

        <p><A href="/cabinet/likes"> LikesPage.jsx</A></p>
        <p><A href="/cabinet/friends"> FriendsPage.jsx</A></p>

        <p><A href="/cabinet/feed"> FeedPage.jsx</A></p>

        <p><A href="/cabinet/chats"> ChatsPage.jsx</A></p>
        <p><A href="/cabinet/chats/1"> ChatPage.jsx // Открытая Карточка</A></p>

        <h2>Админка</h2>
        <p><A href="/admin"> админка</A></p>
      </div>
    </Slide>
  </Page>
);
