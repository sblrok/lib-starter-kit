import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@lskjs/ui/Grid';
import TopBar from '../../components/TopBar';
import SubBar from '../../components/SubBar';

import Layout from '../Layout';

const MainLayout = ({ children }) => (
  <Layout>
    <Layout.Wrapper>
      <Layout.Header>
        <Layout.TopBar>
          <Container>
            <TopBar />
          </Container>
        </Layout.TopBar>
        <Layout.SubBar>
          <Container>
            <SubBar />
          </Container>
        </Layout.SubBar>
      </Layout.Header>
      <Layout.Body>
        <Container>
          {children}
        </Container>
      </Layout.Body>
    </Layout.Wrapper>
  </Layout>
);

MainLayout.propTypes = {
  children: PropTypes.instanceOf(PropTypes.any).isRequired,
};

export default MainLayout;
