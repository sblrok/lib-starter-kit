import React from 'react';
import BasePage from '@lskjs/ui/Page';
import { ThemeProvider } from 'emotion-theming';
import theme from '../../../theme';
import MainLayout from '../../../layouts/MainLayout';

export default class Page extends BasePage {
  render() {
    const { layout = 'main' } = this.props;
    let content;
    if (layout === 'main') {
      content = (
        <MainLayout>
          {super.render()}
        </MainLayout>
      );
    } else {
      content = super.render();
    }
    return (
      <ThemeProvider theme={theme}>
        {content}
      </ThemeProvider>
    );
  }
}
