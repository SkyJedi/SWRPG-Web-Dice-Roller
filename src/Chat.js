import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';
import Popup from 'react-popup';
import './popup.css';
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
    let chat = this.imgCheck(this.refs.chatInput.value);
    chat = this.urlCheck(chat);
    chat = `<span>${user}: `+ chat + `</span>`
    this.state.chatRef.push().set(chat);
    this.refs.chatInput.value = '';
  }

  imgCheck(chat) {
    chat = chat.split(' ');
    for (var i=0; i<chat.length; i++) {
        if (chat[i].startsWith('[') && chat[i].endsWith(']')) {
          chat[i] = chat[i].slice(1).slice(0, -1).toLowerCase();
          chat[i] = `<img class=tinydie src=/images/${chat[i]}.png /> `;
        }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  urlCheck(chat) {
    chat = chat.split(' ');
    for (var i=0; i<chat.length; i++) {
        if (chat[i].includes('http')) {
          chat[i] = `</span><a href="${chat[i]}" style="font-size: small">${chat[i]}</a><span>`;
        }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  popupDeleteMessage(key) {
    Popup.create({
    title: 'Delete Message',
    content: 'Are you sure, this will delete this message',
    className: 'chat',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.chatRef.child(key).remove();
              Popup.close();
            }
        }]
    }});
  }

  clear() {
    Popup.create({
    title: 'Clear Chat',
    content: 'Are you sure, this will clear all the chat',
    className: 'chat',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.chatRef.remove();
              Popup.close();
            }
        }]
    }});
  }

  render() {
    return (
      <div className='App' style={{margin: '5px'}}>
        <form ref='chatForm' onSubmit={this.sendchat.bind(this)}>
        <input className='textinput' style={{width:'285px', margin: '0px'}} ref='chatInput' required/>
        <button ref='send' className='lrgButton' style={{width:'45px', margin: '0 0 0 2px'}}>Send</button>
        </form>
        <div className='messagebox' style={{maxHeight: '350px', maxWidth: '350px'}}>
          {Object.entries(this.state.chat).reverse().map(([k,v])=>
            <div className='message' style={{maxWidth: '18em', minHeight: '0px', lineHeight: 1.2}} key={k}>
            <button onClick={this.popupDeleteMessage.bind(this, k)} style={{float: 'right', height: '20px', width: '20px', background: 'none', color: '#969595', fontSize: '12px', border: 'none'}}>X</button>
            <div dangerouslySetInnerHTML={{ __html: v }} />
            </div>
          )}
          <button className='btnAdd' style={{float: 'right', width: '70px', marginRight: '3px', fontSize: '70%'}} onClick={this.clear.bind(this)}>Clear</button>
        </div>

      </div>
    );
  }
}
  export default Chat;
