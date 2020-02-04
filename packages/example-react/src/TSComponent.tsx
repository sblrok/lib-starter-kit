import React from 'react';
import getRandom from './getRandom'; //eslint-disable-line

class TSComponent extends React.Component<any, any> {
  state = {
    count: 1,
  };

  // constructor(props: any) {
  //   super(props);
  //   console.log('constructed');
  // }

  public handleClick(): any {
    const { count } = this.state;
    this.setState({
      count: count + 1,
    });
  }

  public render(): any {
    return <div onClick={() => this.handleClick()}>{getRandom()}</div>; //eslint-disable-line
  }
}

export default TSComponent;
