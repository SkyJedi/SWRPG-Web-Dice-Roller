import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';


var channel = window.location.pathname.slice(1).toLowerCase();

class Message extends Component {
  constructor() {
    super();
    this.state = {
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.messageRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        message: snap.val()
        });
      } else {
        this.setState({
          message: 0
          });
      }
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
  render() {
    return (
      <div className='messagebox'>
      <div>
        {Object.entries(this.state.message).reverse().map(([k,v])=>
          <div className='message' style={{lineHeight: '1.2'}} key={k}>
          <button onClick={this.popupDeleteMessage.bind(this, k)} style={{float: 'right', height: '20px', width: '20px', background: 'none', color: '#969595', fontSize: '12px', border: 'none'}}>X</button>
          <div dangerouslySetInnerHTML={{ __html: v }} />
          </div>
        )}
      </div>
      </div>
    );
  }
}
  export default Message;
