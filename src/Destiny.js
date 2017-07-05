import React, { Component } from 'react';
import * as firebase from 'firebase';
import Popup from 'react-popup';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);


class Destiny extends Component {

  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child(`${channel}`).child('destiny'),
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.destinyRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        destinyPoint: snap.val()
        });
      } else {
        this.setState({
          destinyPoint: 0
          });
      }
    });
  }

  destinyAdd() {
    this.state.destinyRef.push().set('lightside');
    this.state.messageRef.push().set({text: `${user} added a light side point.`});
  }
  destinyRemove() {
    if (this.state.destinyPoint !== 0) {
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
      this.state.messageRef.push().set({text: `${user} removed a destiny point.`});
    }
  }
  flip (v, k) {
    if (v === 'lightside') {
      this.state.destinyRef.child(k).set('darkside');
      this.state.messageRef.push().set({text: `${user} used a light side point.`})
    } else {
      this.state.destinyRef.child(k).set('lightside');
      this.state.messageRef.push().set({text: `${user} used a dark side point.`})
    }
  }

  destinyReset() {
    Popup.create({
    title: 'Reset Destiny',
    content: 'Would you like to reset Destiny?',
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'RESET',
            className: 'danger',
            action: () => {
              this.state.destinyRef.remove();
              this.state.messageRef.push().set({text: `${user} resets the destiny pool.`});
              Popup.close();
            }
        }],
    }});
  }



  render() {
    return (
      <div className='App' style={{width: '525px'}}>
        <div className="destiny-box">
          <div style={{float: 'left', marginLeft: 6}}>
            <button className='btnAdd' title='Add Destiny Point'onClick={this.destinyAdd.bind(this)}>+</button>
            <button className='btnAdd' title='Remove Destiny Point'onClick={this.destinyRemove.bind(this)}>-</button>
            <button className='btnAdd' title='Reset Destiny' style={{background: '#9e9e9e'}} onClick={this.destinyReset.bind(this)}>X</button>

          </div>
          <div style={{marginLeft: '60px'}}>
            {Object.entries(this.state.destinyPoint).map(([k,v])=>
              <span key={k} onClick={this.flip.bind(this, v, k)}>
              <img className='tokens' title='Click to flip Destiny Point' style={{padding: '5px 0 0 1px'}}src={`/images/${v}.png`} alt={v} />
              </span>
            )}
          </div>

        </div>
      </div>
    );
  }
}

export default Destiny;
