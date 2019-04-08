import React from 'react';
import propTypes from 'prop-types';

const Demo = ({ color, children, ...props }) => (
  <div style={{ color }} {...props}>{children}</div>
);

Demo.propTypes = {
  color: propTypes.number,
  children: propTypes.shape,
};

Demo.defaultProps = {
  color: null,
  children: 'Hello World',
};

export default ({ storiesOf, action, knob }) => {
  return storiesOf('Demo', module)
    .add('default', () => (
      <Demo />
    ));
};
