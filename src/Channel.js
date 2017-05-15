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
      <h1>D1-C3</h1> <div />
      <img src={`/favicon.ico`} alt='' style={{maxWidth:'225px'}} />
      <form onSubmit={this.setChannel.bind(this)}>
        <input className='textinput' style={{textAlign: 'center'}} ref="channel" name="channel" placeholder="Channel Name" /> <div />
        <input className='textinput' style={{textAlign: 'center'}} ref="user" name="user" placeholder="User Name" />
        <div>
        <button className='lrgButton'>Enter</button>
        </div>
      </form>
        <div style={{paddingTop: '2em'}}>
          <span>Created by SkyJedi</span> <div />
          <h6>An assistant (dice roller, destiny tracking, chat) for Fantasy Flight Games, Star Wars: Edge of the Empire, Age of Rebellion, and Force and Destiny</h6>
        </div>
      </div>
    );
  }
}
  export default Channel;
