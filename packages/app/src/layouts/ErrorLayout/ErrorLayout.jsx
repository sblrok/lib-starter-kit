import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Error from '@buzzguru/ui/Error';
import ErrorImage from './ErrorLayout.styles';
import icError from './ic-error.png';
import icError2x from './ic-error@2x.png';
import icError3x from './ic-error@3x.png';
import MainLayout from '../MainLayout';

const ErrorLayout = ({ uapp, ...props }) => {
  const err = uapp.getError(props);
  return (
    <MainLayout>
      <Error
        icon={(
          <div>
            <ErrorImage
              alt={err.message}
              src={icError}
              srcSet={`${icError2x} 2x, ${icError3x} 3x`}
              className="ic-error"
            />
          </div>
        )}
        subtitle={err.message}
      />
    </MainLayout>
  );
};

ErrorLayout.propTypes = {
  uapp: PropTypes.instanceOf(PropTypes.object).isRequired,
};

export default inject('uapp')(observer(ErrorLayout));
