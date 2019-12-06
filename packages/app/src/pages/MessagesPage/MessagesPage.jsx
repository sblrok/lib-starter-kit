import React, { Component } from 'react';

// eslint-disable-next-line
class MessagesPage extends Component {
  render() {
    const { messages } = this.props;
    return (
      <div>{messages.map(message => (<div key={message._id}>message</div>))}</div>
    );
  }
}

export default MessagesPage;
