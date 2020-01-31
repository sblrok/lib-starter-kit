import React from 'react';
import DEV from '@lskjs/ui/DEV';
import If from 'react-if';

export default ({ err }) => (
  <div>
    <h1>
      {`Error: ${err.code || 'unknown error'}`}
    </h1>
    <If condition={!!(err.message)}>
      <h2>
        {err.message}
      </h2>
    </If>
    <DEV json={err} />
  </div>
);
