import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';

var channel = window.location.pathname.slice(1).toLowerCase();

class TopBar extends Component {

constructor() {
  super();
  this.state = {
    database: {},
    databaseRef: firebase.database().ref(),
  };
}

componentDidMount() {
  this.state.databaseRef.on('value', snap => {
    if (snap.val() !== null) this.setState({database: snap.val()});
    else this.setState({database: 0});
  });
}

//this function can reformat the entire firebase database with the click of a button
reformat() {
  let database = Object.assign({}, this.state.database);
  console.log(this.state.database)
  //cycle through every channel
  Object.keys(database).forEach((channel)=> {
    //check if message exists
    if (database[channel].message !== undefined) {
      //reformat the way the data in message was stored
      Object.keys(database[channel].message).forEach((key)=> {
        console.log(channel)
        if (database[channel].message[key] !== undefined && database[channel].message[key].text === undefined) {
          let string = {text: database[channel].message[key]};
          database[channel].message[key] = string;
        }
      })
    }
  })
  this.state.databaseRef.set(database);
}

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
        <button style={{display: 'none'}} onClick={this.reformat.bind(this)}> </button>
    </div>
    );
  }
}
export default TopBar;
