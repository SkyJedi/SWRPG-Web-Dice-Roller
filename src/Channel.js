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
      <div className="App">
      <form onSubmit={this.setChannel.bind(this)}>
      <p>
          <input type="text" ref="uname" name="username" placeholder="User Name" />
          <input type="text" ref="channel" name="channel" placeholder="Channel" />
      </p>
      <div>
      <button>Enter</button>
      </div>
      </form>
      </div>
    );
  }
}
  export default Channel;
