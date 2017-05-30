import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();

class Initiative extends Component {
  constructor() {
    super();
    this.state = {
      slideout: 'none',
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative'),
      Initiative: {
        order: {},
        total: 0,
        turn: 1,
        round: 1,
        rolls: [],
        newslot: [],
    },
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

    this.state.InitiativeRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        Initiative: snap.val()
        });
      } else {
        this.setState({
          Initiative: {
            order: 0,
          }
        });
      }
    });
  }

slideOut() {
  if (this.state.slideout !== 'none'){
    this.setState({slideout: 'none'});
  } else {
    this.setState({slideout: 'block'});
  }
}

InitiativeAdd() {
  this.state.InitiativeRef.child('order').push().set('PC');
}
InitiativeRemove() {
  if (this.state.Initiative.order !== 0) {
    this.state.InitiativeRef.child('order').child(Object.keys(this.state.Initiative.order)[Object.keys(this.state.Initiative.order).length-1]).remove();
  }
}
flip (v, k) {
  if (v === 'PC') {
    this.state.InitiativeRef.child('order').child(k).set('NPC');
  } else {
    this.state.InitiativeRef.child('order').child(k).set('PC');
  }
}


  render() {
    return (
      <div>
        <div className='destiny-box' style={{display: this.state.slideout}}>
          <div style={{float: 'left', marginLeft: 6}}>
            <button onClick={this.InitiativeAdd.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>+</button>
            <button className='btnAdd' style={{display: 'inline-block'}}>←</button>
            <br/>
            <button onClick={this.InitiativeRemove.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>-</button>
            <button className='btnAdd' style={{display: 'inline-block'}}>→</button>

          </div>
          <div style={{marginLeft: '45px'}}>
            {Object.entries(this.state.Initiative.order).map(([k,v])=>
              <span
              key={k}
              onClick={this.flip.bind(this, v, k)}>
              <img
                src={`/images/${v}.png`}
                alt={v}
                className='tokens' />
              </span>
            )}
          </div>
        </div>
        <button type="button" style={{marginBottom: '0.5em'}}onClick={this.slideOut.bind(this)} className='lrgButton'>Show Initiative</button>
        <span>Round: {this.state.Initiative.round}<nsbr/> Turn: {this.state.Initiative.turn}</span>
      </div>
    );
  }
}
  export default Initiative;
