import React, { Component } from 'react';
import Popup from 'react-popup';
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
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
      Initiative: [],
      InitiativePastRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('past'),
      InitiativePast: {},
      position: {},
      positionRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('position'),
    };
  }

  componentDidMount() {
    this.state.InitiativeRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let temp = child.val();
        temp['key'] = child.key;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
      this.setState({
        Initiative: final
        });
      } else {
        this.setState({
          Initiative: 0
        });
      }
    });

    this.state.InitiativePastRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let temp = child.val();
        temp['key'] = child.key;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
      this.setState({
        InitiativePast: final
        });
      } else {
        this.setState({
          InitiativePast: 0
        });
      }
    });

    this.state.positionRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        position: snap.val()
        });
      } else {
        this.setState({
          position: {
            round: 1,
            turn: 1
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
  let i;
  if (this.state.Initiative.length > 0) {
    i = (+(this.state.Initiative[this.state.Initiative.length-1].roll)-10).toString();
  } else {
    i = 0;
  }
  this.state.InitiativeRef.push().set({type: 'PC', roll: i});
}

InitiativeRemove() {
  if (this.state.Initiative !== 0) {
    this.state.InitiativeRef.child((this.state.Initiative[this.state.Initiative.length-1]).key).remove();
  }
}

InitiativePrevious() {
  let position = Object.assign({}, this.state.position);
  let Initiative = this.state.Initiative;
  let InitiativePast = this.state.InitiativePast;
  if (position.turn === 1 && position.round === 1) {
    return;
  }
  if (position.turn - 1 < 1) {
    position.turn = this.state.Initiative.length + this.state.InitiativePast.length;
    position.round--;
    InitiativePast = Initiative;
    Initiative = [InitiativePast.pop()];
  } else {
    position.turn--;
    Initiative.unshift(InitiativePast.pop());
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(this.objectify(Initiative));
  this.state.InitiativePastRef.set(this.objectify(InitiativePast));
}

InitiativeNext() {
  if (this.state.Initiative.length + this.state.InitiativePast.length === 0) {
    return;
  }
  let position = Object.assign({}, this.state.position);
  let Initiative = this.state.Initiative;
  let InitiativePast = this.state.InitiativePast;
  if (position.turn >= this.state.Initiative.length + this.state.InitiativePast.length) {
    position.turn = 1;
    position.round++;
    InitiativePast.push(Initiative.shift());
    Initiative = InitiativePast;
    InitiativePast = 0;
  } else {
    position.turn++;
    InitiativePast.push(Initiative.shift());
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(this.objectify(Initiative));
  this.state.InitiativePastRef.set(this.objectify(InitiativePast));
}

objectify(array) {
  if (array === 0) {return 0;}
  let object = {};
  array.forEach(function(slot) {
    let key = slot.key;
    delete slot.key;
    object[key] = slot;
  });
  return object;
}

flip (slot, time) {
  if (time === 'current') {
    if (slot.type === 'PC') {
      this.state.InitiativeRef.child(slot.key).update({'type': 'NPC'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

    } else {
      this.state.InitiativeRef.child(slot.key).update({'type': 'PC'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll+1).toString()});

    }
  } else {
      if (slot.type === 'PC') {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'NPC'});
        this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

      } else {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'PC'});
        this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll+1).toString()});

      }
  }
}

Remove (slot, time) {
  if (time === 'current') {
      this.state.InitiativeRef.child(slot.key).remove();
  } else {
      this.state.InitiativePastRef.child(slot.key).remove();
  }
}

Reset () {
  firebase.database().ref().child(`${channel}`).child('Initiative').remove();
}

popupModifyInitiativeSlot(slot, time) {
  Popup.create({
  title: 'Modify Initiative Slot',
  content: 'What would like to do to this Initiative Slot?',
  className: 'alert',
  buttons: {
      left: [{
          text: 'DELETE',
          className: 'danger',
          action: () => {
            this.Remove(slot,time);
            Popup.close();
          }
      }],

      right: [{
          text: 'Flip',
          action: () => {
            this.flip(slot,time);
            Popup.close();
          }
      }]
  }});
}

popupReset() {
  Popup.create({
  title: 'Reset Initiative',
  content: 'Would you like to reset Initiative?',
  className: 'alert',
  buttons: {
      left: ['cancel'],
      right: [{
          text: 'RESET',
          className: 'danger',
          action: () => {
            this.Reset();
            Popup.close();
          }
      }],
  }});
}
  render() {
    return (
      <div>
        <div className='destiny-box' style={{display: this.state.slideout}}>
          <div style={{float: 'left', marginLeft: 6}}>
            <button onClick={this.InitiativeAdd.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>+</button>
            <button onClick={this.InitiativeNext.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>→</button>
            <br/>
            <button onClick={this.InitiativeRemove.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>-</button>
            <button onClick={this.InitiativePrevious.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>←</button>
          </div>
          <div style={{marginLeft: '85px'}}>
            {this.state.Initiative.map((slot)=>
              <span
              key={slot.key}
              onClick={this.popupModifyInitiativeSlot.bind(this, slot, 'current')}>
              <img
                src={`/images/${slot.type}.png`}
                alt={slot.type}
                className='tokens' />
              </span>
            )}
            <img src={`/images/repeat.png`} alt='' className='tokens' />
            {Object.entries(this.state.InitiativePast).map(([k,v])=>
              <span
              key={k}
              onClick={this.popupModifyInitiativeSlot.bind(this, v, k, 'past')}>
              <img
                src={`/images/${v['type']}.png`}
                alt={v}
                className='tokens' />
              </span>
            )}
          </div>
          <br/>
          <button type="button" className='lrgButton' style={{marginBottom: '0.5em', fontSize: '14px', background: '#9e9e9e'}} onClick={this.popupReset.bind(this)} >Reset Initiative</button>
          <b>Round: {this.state.position.round}<nsbr/> Turn: {this.state.position.turn}</b>

        </div>
        <button type="button" style={{marginBottom: '0.5em', fontSize: '14px', height: '15px', width: '55px'}}onClick={this.slideOut.bind(this)} className='lrgButton'>Initiative</button>
    </div>
    );
  }
}
  export default Initiative;
