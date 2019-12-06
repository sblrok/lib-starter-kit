import React, { Component } from 'react';

class VideoPage extends Component { // eslint-disable-line 123
  render() {
    const { item } = this.props;
    return (
      <Page>
        <Page.Header>
          <Page.Breadcrumbs />
        </Page.Header>
        <Page.Body>
          body
        </Page.Body>
      </Page>
    );
  }
}

export default VideoPage;
