import React, { Component } from 'react';
import pick from 'lodash/pick';
import { Form, FastField, withFormik } from 'formik';
import createFormWithI18 from '@lskjs/form/createFormWithI18';
import FormSubmit from '@lskjs/form/FormSubmit';
import Page from '@lskjs/ui/Page';

import T from '@lskjs/ui/T';
import Input from '@lskjs/form/controls/Input';


import { inject } from 'mobx-react';

const controls = ({ i18 = { t: a => a } }) => ({
  text: {
    component: Input,
    title: i18.t('chatForm.text'),
    required: true,
  },
});

const ChatFormView = ({ control, status, errors }) => (
  <Form className="ant-form ant-form-vertical">
    <FastField {...control('text')} />
    <FormSubmit
      block
      status={status}
      errors={errors}
    >
      <T name="buttons.send" />
    </FormSubmit>
  </Form>
);

const ChatForm = createFormWithI18(({ i18 }) => ({
  withFormik,
  view: ChatFormView,
  controls: controls({ i18 }),
}));


@inject('user', 'api', 'uapp')
class MessagesPage extends Component {
  state = {
    messages: [],
  }
  async componentDidMount() {
    const { api, uapp, chatId: _id } = this.props;
    //
    this.socket = api.ws('/api/v5/chats', {
      query: { _id },
    });
    console.log('uapp.config', uapp.config);
    console.log('this.socket', this.socket);
    // const socket = api.io('', {})
    // console.log('api.io', api.io);
    window.socket = this.socket;
    if (this.socket) {
      this.socket.on('message', async (message) => {
      // console.log('message@@!!');
        const { messages } = this.state;
        messages.push(message);
        this.setState({ messages });
      });
      let i = 0;
      setInterval(() => {
        i += 1;
        console.log('EMIT EMIT');
        this.socket.emit('sendMessage', { content: `test ${i}` });
      }, 1000);
    }
    const res = await this.getLastMessages();
    this.setState({ messages: res.data || [] });
  }
  componentWillUnmount() {
    this.socket && this.socket.disconnect();
  }

  onSubmit(value) {
    const { text } = value;

    const { api, chatId: _id } = this.props;
    if (!text || text.length === 0) return;
    // this.socket.emit('message', { content: text });
    api.fetch('/api/v5/chat/sendMessage', {
      method: 'post',
      data: {
        _id,
        content: {
          text,
        },
      },
    });
  }

  getLastMessages() {
    const { api, chatId } = this.props;
    return api.fetch('/api/v5/messages/find', {
      method: 'post',
      data: { filter: { chatId } },
    });
  }

  renderMessages() {
    const { messages } = this.state;
    return (
      <div>
        {messages.map(message => (
          <div key={message._id}>
            {message.content && message.content.text}
          </div>
        ))}
      </div>
    );
    // return (
    //   <div>
    //     {messages.map(message => (
    //       <div key={message._id} styleName="container">
    //         {/* <img src={_.get(message, 'user.profile.avatar')} /> */}
    //         <div styleName="info">
    //           <div styleName="author">
    //             {message.user.name}
    //           </div>
    //           {message.text}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // );
  }
  render() {
    return (
      <Page>
        <Page.Header />
        <Page.Body>
          {this.renderMessages()}
          <ChatForm onSubmit={::this.onSubmit} />
        </Page.Body>
      </Page>
    );
  }
}


export default MessagesPage;
