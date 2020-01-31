import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';
import theme from '../../theme';
import { Wrapper, Header, TopBar, SubBar, Body } from './Layout.styles';
class Layout extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
  }
  static Wrapper = Wrapper;
  static Header = Header;
  static TopBar = TopBar;
  static SubBar = SubBar;
  static Body = Body;
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
