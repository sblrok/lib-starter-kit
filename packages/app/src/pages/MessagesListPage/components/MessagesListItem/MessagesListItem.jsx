
import React from 'react';
import Link from '@lskjs/ui/Link';
import toShort from '@lskjs/utils/formatter';
import { If, Else, Then } from 'react-if';
import PropTypes from 'prop-types';

const MessagesListItem = ({ item }) => (
  <div asd={console.log(item)}>message</div>
);

MessagesListItem.propTypes = {
  item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default MessagesListItem;
