import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@lskjs/ui/Grid';
import Layout from '../Layout';
import Navbar from './Navbar';

const MainLayout = ({ children }) => (
  <Layout>
    <Layout.Wrapper>
      <Layout.Header>
        <Navbar />
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
  children: PropTypes.any.isRequired,
};

export default MainLayout;
