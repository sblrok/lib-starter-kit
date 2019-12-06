import React, { Component } from 'react';
import Avatar from '@lskjs/ui/Avatar';
import If from 'react-if';

export default class UserAvatar extends Component {
  render() {
    const { user } = this.props;

    return (
      <Avatar
        id={user._id}
        src={user.avatar}
        size={64}
        title={user.name}
      >
        <If condition={user.online}>
          <Avatar.Badge right bottom>
            <div style={{
              width: 10, height: 10, backgroundColor: '#F44336', borderRadius: '50%', border: '2px solid #fff',
            }}
            />
          </Avatar.Badge>
        </If>
        <If condition={user.nativeLanguages && user.nativeLanguages[0]}>
          <Avatar.Badge left top>
            {user.nativeLanguages[0]}
          </Avatar.Badge>
        </If>
        <If condition={user.accountType && user.accountType !== 'BASIC'}>
          <Avatar.Badge top>
            {user.accountType}
          </Avatar.Badge>
        </If>
      </Avatar>
    );
  }
}
