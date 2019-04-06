import React from 'react';
import propTypes from 'prop-types';

const a = { b: { c: { d: 1 } } };  //eslint-disable-line
// const c = a?.b?.c?.d;

const Demo = ({ color, children, ...props }) => (
  <div style={{ color }} {...props}>
    {/* {a?.b?.c?.d || 1} */}
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

export default Demo;
