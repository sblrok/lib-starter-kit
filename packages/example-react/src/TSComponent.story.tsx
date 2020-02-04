import React from 'react';
import propTypes from 'prop-types';
import TSComponent from './TSComponent'; // eslint-disable-line

const Demo = ({ color, children, ...props }: any): any => (
  <div style={{ color }} {...props}>
    <TSComponent />
    {children}
  </div>
);

Demo.propTypes = {
  color: propTypes.string,
  children: propTypes.shape,
};

Demo.defaultProps = {
  color: null,
  children: 'Hello World',
};

export default ({ storiesOf }: { storiesOf: (name: string, module: {}) => any }): any =>
  storiesOf('Typescript', module)
    .add('default', () => <Demo />)
    .add('color=red', () => <Demo color="red" />);
