import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';
import theme from '@buzzguru/ui/assets/theme';
import { Wrapper, Header, TopBar, SubBar, Body } from './Layout.styles';

class Layout extends Component {
  static Wrapper = Wrapper;
  static Header = Header;
  static TopBar = TopBar;
  static SubBar = SubBar;
  static Body = Body;
  static propTypes = {
    children: PropTypes.instanceOf(PropTypes.any).isRequired,
  }
  render() {
    const { children } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <React.Fragment>
          {children}
        </React.Fragment>
      </ThemeProvider>
    );
  }
}

export default Layout;
