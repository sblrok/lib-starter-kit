import React from 'react';
import { inject, observer } from 'mobx-react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import If from 'react-if';
import A from '@lskjs/ui/A';
import DEV from '@lskjs/ui/DEV';

export const MyNavbar = ({ user }) => (
  <Navbar bg="light" expand="lg">
    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
        {/* <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#link">Link</Nav.Link> */}
        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
          <DEV json={user} />
          <If condition={!!(user && user._id)}>
            <div>
              {user ? user.name : '???'}
              <A href="/auth/logout">logout</A>
            </div>
          </If>
          <If condition={!(user && user._id)}>
            <div>
              <A href="/cabinet">Cabinet</A>
            </div>
          </If>
          {/* <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item> */}
          {/* <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item> */}
        </NavDropdown>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default inject('user')(observer(MyNavbar));
