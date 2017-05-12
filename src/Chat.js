import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chat: {},
      chatRef: firebase.database().ref().child(`${channel}`).child('chat'),
    };
  }

  componentDidMount() {
    this.state.chatRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        chat: snap.val()
        });
      } else {
        this.setState({
          chat: 0
          });
      }
    });
  }

  sendchat(stop) {
    stop.preventDefault();
    this.state.chatRef.push().set(`${user}: ${this.refs.chatInput.value}`);
    this.refs.chatInput.value = '';
  }

  render() {
    return (
      <div className='App' style={{float: 'right'}}>
      <form ref='chatForm' onSubmit={this.sendchat.bind(this)}>
      <input className='chatinput' ref='chatInput' required/>
      <button ref='send' className='lrgButton'>Send</button>
      </form>
      <div>
        {Object.entries(this.state.chat).reverse().map(([k,v])=>
          <div className='message' style={{maxWidth: '20em', minHeight: '0px', lineHeight: 1.2}} key={k}>
          <div>{v}</div>
          </div>
        )}
      </div>
      </div>
    );
  }
}
  export default Chat;
