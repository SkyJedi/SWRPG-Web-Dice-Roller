import React, { Component } from 'react';
import './index.css';

class Channel extends Component {

  setChannel(stop) {
    stop.preventDefault();
    var channel = this.refs.channel.value;
    this.props.setFormChan(channel);
  }

  render() {
    return (
      <div>
      <form onSubmit={this.setChannel.bind(this)}>
        <input className='login-input' ref="channel" name="channel" placeholder="Channel" />
        <div>
        <button className='login-button'>Enter</button>
        </div>
      </form>
      </div>
    );
  }
}
  export default Channel;
