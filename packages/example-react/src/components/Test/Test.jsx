import React, { Component } from 'react';
import TSComponent from '../../TSComponent.tsx';

export default class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      test: Math.random(),
    };
  }
  render() {
    const { test } = this.state;
    return (
      <div>
        {test}
        <div>
          Typescript:
          <TSComponent />
        </div>
      </div>
    );
  }
}
