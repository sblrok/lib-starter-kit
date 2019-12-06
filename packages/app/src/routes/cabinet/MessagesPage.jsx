import React, { Component } from 'react';
import Page from '@lskjs/ui/Page';
import Link from '@lskjs/ui/Link';
import UserAvatar from '../UserAvatar';
import ChatItem from './ChatItem';

class MessagesPage extends Component {
  render() {
    const { users, chats } = this.props;
    return (
      <Page>
        <Page.Header />
        <Page.Body>
          <div style={{ display: 'flex' }}>
            {users.map(user => (
              <Link href={`/cabinet/users/${user._id}`}>
                <UserAvatar
                  key={user._id}
                  user={user}
                />
              </Link>
            ))}
          </div>
          {chats.map(chat => (
            <Link href={`/cabinet/chats/${chat._id}`}>
              <ChatItem
                item={chat}
              />
            </Link>
          ))}
        </Page.Body>
      </Page>
    );
  }
}


export default MessagesPage;
