import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';

var channel = window.location.pathname.slice(1).toLowerCase();

class TopBar extends Component {

  signOut() {
    window.location = `/`;
  }

  popupDeleteChannel() {
    Popup.create({
    title: 'Delete Channel',
    content: 'Are you sure, this will delete all Data in ' + channel,
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              firebase.database().ref().child(`${channel}`).remove();
              this.signOut();
              Popup.close();
            }
        }]
    }});
  }


  render() {
    return (
      <div>
        <button className='btnAdd' style={{float: 'right', width: '70px', marginRight: '3px', fontSize: '70%'}} onClick={this.popupDeleteChannel.bind(this)}>Delete Channel</button>
        <button className='btnAdd' style={{float: 'right', width: '70px', marginRight: '3px'}} onClick={this.signOut.bind(this)}>Logout</button>
      </div>
    );
  }
}
export default TopBar;
