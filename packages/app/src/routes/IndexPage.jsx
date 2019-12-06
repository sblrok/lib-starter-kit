import React from 'react';

export default ({ about = {} }) => (
  <div>
    <h1>{about.title}</h1>
    <p>{about.description}</p>
    IndexPage v5.2
    {__DEV__ ? 'DEV' : '?'}
  </div>
);
