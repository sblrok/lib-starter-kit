import React, { Component } from 'react';
import { observer } from 'mobx-react';
import T from '@lskjs/ui/T';
import List from '@lskjs/list';
import listParams from './components/listParams';


@observer
class MessageListPage extends Component {
  render() {
    const { listStore } = this.props;
    return (
      <List
        {...listParams}
        listStore={listStore}
        filterProps={{
          hasFilter: listStore.hasFilter,
          clearFilter: listStore.clearFilter,
        }}
      />
    );
  }
}

export default MessageListPage;
