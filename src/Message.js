import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

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

htmlDecode(input){
 var e = document.createElement('div');
 e.innerHTML = input;
 return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

  render() {
    return (
      <div className='App'>
      <div>
        {Object.entries(this.state.message).reverse().map(([k,v])=>
          <div className='message' key={k}>

          <div dangerouslySetInnerHTML={{ __html: v }} />
          </div>
        )}
      </div>
      </div>
    );
  }
}
  export default Message;
