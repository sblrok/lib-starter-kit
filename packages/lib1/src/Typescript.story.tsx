import React from 'react';
import propTypes from 'prop-types';
import TSComponent from './TSComponent';

const Demo = ({ color, children, ...props }) => (
  <div style={{ color }} {...props}>
    <TSComponent />
    {children}
  </div>
);

Demo.propTypes = {
  color: propTypes.number,
  children: propTypes.shape,
};

Demo.defaultProps = {
  color: null,
  children: 'Hello World',
};

export default ({ storiesOf }) => (
  storiesOf('Typescript', module)
    .add('default', () => (
      <Demo />
    ))
);
