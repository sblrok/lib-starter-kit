import React, { Component } from 'react';
import Carousel from '@lskjs/ui/Carousel';
import Link from '@lskjs/ui/Link';
import UserAvatar from '../UserAvatar';

// eslint-disable-next-line react/prefer-stateless-function
class UserCard extends Component {
  render() {
    const { user } = this.props;
    return (
      <div>
        <h2>{user.name}</h2>
        <Link href={`/cabinet/users/${user._id}`}>
          <UserAvatar
            key={user._id}
            user={user}
          />
        </Link>
        <Carousel items={user.photos.map(photo => photo.original)} />
        <div>{user.description}</div>
        <div>
          <b>Родной:</b>
          {user.nativeLanguages}
        </div>
        <div>
          <b>Изучает:</b>
          {user.learningLanguages}
        </div>
        <div>
          <b>Живет:</b>
          {user.city}
        </div>
        <div>
          <b>Расстояние:</b>
          {user.distance}
        </div>
      </div>
    );
  }
}


export default UserCard;
