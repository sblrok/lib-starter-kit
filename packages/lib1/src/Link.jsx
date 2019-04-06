import React from 'react';

const STATUS = {
  HOVERED: 'hovered',
  NORMAL: 'normal',
};

export default class Link extends React.Component {
  constructor(props) {
    super(props);

    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);

    this.state = {
      className: STATUS.NORMAL,
    };
  }

  _onMouseEnter() {
    this.setState({ className: STATUS.HOVERED });
  }

  _onMouseLeave() {
    this.setState({ className: STATUS.NORMAL });
  }

  render() {
    const { className } = this.state;
    const { page, children, props } = this.props; // eslint-disable-line react/prop-types
    return (
      <a
        className={className}
        href={page || '#'}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        {...props}
      >
        {children}
      </a>
    );
  }
}
