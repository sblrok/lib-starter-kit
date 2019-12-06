import React, { Component } from 'react';
import Page from '@lskjs/ui/Page';
import UserCard from './UserCard';

// eslint-disable-next-line react/prefer-stateless-function
class UsersPage extends Component {
  render() {
    const { users } = this.props;
    return (
      <Page>
        <Page.Header />
        <Page.Body>
          {users.map(user => (
            <UserCard
              key={user._id}
              user={user}
            />
          ))}
        </Page.Body>
      </Page>
    );
  }
}


export default UsersPage;
