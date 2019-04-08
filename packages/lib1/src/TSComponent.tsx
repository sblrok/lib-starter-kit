import React from 'react';
import getRandom from './getRandom';

class TSComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div>
        {getRandom()}
      </div>
    );
  }
}

export default TSComponent;