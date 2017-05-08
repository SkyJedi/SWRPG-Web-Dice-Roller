import React, { Component } from 'react';
import './Default.css';

class Channel extends Component {
  setChannel(stop) {
    stop.preventDefault();
    var channel = this.refs.channel.value;
    console.log(this.refs.channel.value);
    this.props.setFormChan(channel);
  }

  render() {
    return (
      <div className="App">
      <form onSubmit={this.setChannel.bind(this)}>
        User Name
          <input type="text" ref="uname" name="username" placeholder="User Name" />
        Channel
          <input type="text" ref="channel" name="channel" placeholder="Channel" />
          <button>Enter</button>
      </form>
      </div>
    );
  }
}
  export default Channel;
