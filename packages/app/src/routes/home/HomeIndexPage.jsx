import React from 'react';
import A from '@lskjs/ui/A';

export default ({ about = {} }) => (
  <div>
    <h1>{about.title}</h1>
    <p>{about.description}</p>
    IndexPage v5.2
    {__DEV__ ? 'DEV' : '?'}

    <h2>Лендинг</h2>
    <p><A href="/"> Главная</A></p>
    <p><A href="/about"> О проекте</A></p>


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
);
