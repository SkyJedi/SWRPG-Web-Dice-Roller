import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';
var reRoll = require("./functions/reRoll.js").reRoll;



var channel = window.location.pathname.slice(1).toLowerCase();

class Message extends Component {
  constructor() {
    super();
    this.state = {
      message: 0,
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.messageRef.on('value', snap => {
      if (snap.val() !== null) this.setState({message: snap.val()});
      else this.setState({message: 0});
    });
  }

  popupDeleteMessage(key) {
    Popup.create({
    title: 'Delete Message',
    content: 'Are you sure, this will delete this message',
    className: 'messages',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.messageRef.child(key).remove();
              Popup.close();
            }
        }]
    }});
  }

  reRoll(key) {
    let message = Object.assign({}, this.state.message[key]);

    if (Object.keys(message).length > 1) reRoll(message);
  }

  clear() {
    Popup.create({
    title: 'Clear Messages',
    content: 'Are you sure, this will clear all the messages',
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.messageRef.remove();
              Popup.close();
            }
        }]
    }});
  }

  render() {
    return (
      <div className='messagebox'>
      <div>
        {Object.keys(this.state.message).reverse().map((k)=>
          <div className='message' style={{lineHeight: '1.2'}} key={k}>
          <button onClick={this.popupDeleteMessage.bind(this, k)} style={{float: 'right', height: '20px', width: '20px', background: 'none', color: '#969595', fontSize: '12px', border: 'none'}}>X</button>
          <div onClick={this.reRoll.bind(this, k)} dangerouslySetInnerHTML={{ __html: this.state.message[k].text }} />
          </div>
        )}
        <button className='btnAdd' style={{float: 'right', width: '70px', marginRight: '3px', fontSize: '70%'}} onClick={this.clear.bind(this)}>Clear</button>
      </div>
      </div>
    );
  }
}
  export default Message;
