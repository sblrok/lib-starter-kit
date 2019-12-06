import React, { Component } from 'react';
import Page from '@lskjs/ui/Page';
import UserCard from './UserCard';

// eslint-disable-next-line react/prefer-stateless-function
class UserPage extends Component {
  render() {
    const { user } = this.props;
    return (
      <Page>
        <Page.Header />
        <Page.Body>
          <UserCard user={user} />
        </Page.Body>
      </Page>
    );
  }
}


export default UserPage;
