import React, { Component } from 'react';
import './index.css';

class Channel extends Component {

  setChannel(stop) {
    stop.preventDefault();
    var channel = this.refs.channel.value.replace(/\W/g, '').toLowerCase();
;
    var user = this.refs.user.value.replace(/\W/g, '');
    this.props.setFormChan(channel, user);
  }

  render() {
    return (
      <div className='login-box'>
      <h1>D1-C3</h1> <div />
      <img src={`/favicon.png`} alt='' style={{maxWidth:'225px'}} />
      <form onSubmit={this.setChannel.bind(this)}>
        <input className='textinput' style={{textAlign: 'center'}} ref="channel" name="channel" placeholder="Channel Name" /> <div />
        <input className='textinput' style={{textAlign: 'center'}} ref="user" name="user" placeholder="User Name" />
        <div>
        <button className='lrgButton'>Enter</button>
        </div>
      </form>
        <div style={{paddingTop: '2em'}}>
          <span>Created by SkyJedi</span> <br/><br/>
          <span>Questions? Comments? <a href="mailto:skyjedi@gmail.com?subject=D1-C3%20Feedback">Contact Me</a></span> <div />
          <h6>An assistant (dice roller, chat, Story Point tracker, character tracker, initiative tracker) for Fantasy Flight Games, Genesys</h6>
        </div>
      </div>
    );
  }
}
  export default Channel;
