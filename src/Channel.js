import React, { Component } from 'react';
import './index.css';

class Channel extends Component {

  setChannel(stop) {
    stop.preventDefault();
    var channel = this.refs.channel.value;
    var user = this.refs.user.value;
    this.props.setFormChan(channel, user);
  }

  render() {
    return (
      <div className='login-box'>
      <form onSubmit={this.setChannel.bind(this)}>
        <input className='login-input' ref="channel" name="channel" placeholder="Channel" /> <div />
        <input className='login-input' ref="user" name="user" placeholder="User Name" />
        <div>
        <button className='login-button'>Enter</button>
        </div>
      </form>
      </div>
    );
  }
}
  export default Channel;
