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
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
      Initiative: [],
      InitiativePastRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('past'),
      InitiativePast: [],
      position: {},
      positionRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('position'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
    };
  }

  componentDidMount() {
    this.state.InitiativeRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        for(var i=0; i<Object.keys(temp.bonusDie).length; i++) {
          var colorDie = Object.keys(temp.bonusDie)[i];
          for(var j=0; j<temp.bonusDie[colorDie]; j++) {
            tempBonus.push(`${colorDie}`);
          }}
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        this.setState({Initiative: final});
      } else {
        this.setState({Initiative: 0});
      }
    });

    this.state.InitiativePastRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        for(var i=0; i<Object.keys(temp.bonusDie).length; i++) {
          var colorDie = Object.keys(temp.bonusDie)[i];
          for(var j=0; j<temp.bonusDie[colorDie]; j++) {
            tempBonus.push(`${colorDie}`);
          }}
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        this.setState({InitiativePast: final});
      } else {
        this.setState({InitiativePast: 0});
      }
    });

    this.state.positionRef.on('value', snap => {
      if (snap.val() != null) {
        this.setState({position: snap.val()});
      } else {
        this.setState({position: {round: 1,turn: 1}});
      }
    });

    this.state.characterRef.on('value', snap => {
      if (snap.val() !== null) {
        this.setState({character: snap.val()});
      } else {
        this.setState({character: {}});
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
  let i=0;
  let Initiative = Object.assign({}, this.state.Initiative);

  if (Object.keys(Initiative).length > 0) {
    i = ((+Initiative[0].roll)-10).toString()
  } else {
    i = 0;
  }
  this.state.InitiativeRef.push().set({type: 'pc', roll: i, bonusDie: {blue: 0, black: 0}});
}

InitiativeRemove() {
  if (this.state.Initiative.length !== 0) {
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
  Initiative[0].bonusDie = [];
  if (position.turn >= this.state.Initiative.length + this.state.InitiativePast.length) {
    position.turn = 1;
    position.round++;
    InitiativePast.push(Initiative.shift());
    Initiative = InitiativePast;
    InitiativePast = 0;
    this.clearMarks();
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
    let tempbonusDie = {blue: 0, black:0, upgrade:0, downgrade:0}
    for(var i=0; i<slot.bonusDie.length; i++) {
      tempbonusDie[slot.bonusDie[i]]++;
    }
    slot.bonusDie = tempbonusDie;
    object[key] = slot;
  });
  return object;
}

flip (slot, time) {
  if (time === 'current') {
    if (slot.type === 'pc') {
      this.state.InitiativeRef.child(slot.key).update({'type': 'npc'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

    } else {
      this.state.InitiativeRef.child(slot.key).update({'type': 'pc'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll+1).toString()});

    }
  } else {
      if (slot.type === 'pc') {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'npc'});
        this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

      } else {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'pc'});
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

addBonusDice(slot, time, color) {
  let tempbonusDie = {blue:0, black:0, upgrade:0, downgrade:0}

  for(var i=0; i<slot.bonusDie.length; i++) {
    tempbonusDie[slot.bonusDie[i]]++;
  }
  if (time === 'current') {
    tempbonusDie[color]++;
    this.state.InitiativeRef.child(slot.key).update({'bonusDie': tempbonusDie});

  }
  if (time === 'past') {
    tempbonusDie[color]++;
    this.state.InitiativePastRef.child(slot.key).update({'bonusDie': tempbonusDie});

  }
}

Reset() {
  firebase.database().ref().child(`${channel}`).child('Initiative').remove();
}

clearMarks() {
  if (Object.keys(this.state.character).length !== 0) {
    let character = Object.assign({}, this.state.character);
    Object.keys(character).forEach((key)=>
      character[key].init = '',
    );
  this.state.characterRef.set(character);
  }
}

popupModifyInitiativeSlot(slot, time) {
  Popup.create({
  title: 'Modify Initiative Slot',
  content: 'What would like to do to this Initiative Slot?',
  className: 'initiative',
  buttons: {
      left: [{
          text: 'Bonus',
          className: 'bonus',
          action: () => {
            this.addBonusDice(slot, time, 'blue');
            Popup.close();
          }
        }, {
          text: 'Setback',
          className: 'setback',
          action: () => {
            this.addBonusDice(slot, time, 'black');
            Popup.close();
          }
        }, {
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.Remove(slot,time);
              Popup.close();
            }
        }],
      right: [{
            text: 'Upgrade',
            className: 'upgrade',
            action: () => {
              this.addBonusDice(slot, time, 'upgrade');
              Popup.close();
            }
        }, {
            text: 'Downgrade',
            className: 'downgrade',
            action: () => {
              this.addBonusDice(slot, time, 'downgrade');
              Popup.close();
            }
        },  {
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

genKey() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 15; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

  render() {
    return (
      <div>
        <div className='destiny-box' style={{display: this.state.slideout, minHeight: '150px'}}>
          <div style={{maxWidth: '90px', float: 'left', marginLeft: '6px'}}>
            <button title='Add Initiative Slot' onClick={this.InitiativeAdd.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>+</button>
            <button title='Next Initiative Slot' onClick={this.InitiativeNext.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>→</button>
            <br/>
            <button title='Remove Initiative Slot' onClick={this.InitiativeRemove.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>-</button>
            <button title='Previous Initiative Slot' onClick={this.InitiativePrevious.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>←</button>
            <br/>
            <button title='Reset Initiative' type="button" className='lrgButton' style={{marginBottom: '0.25em', fontSize: '14px', background: '#9e9e9e', margin: '0', width: '58px', height: '20px'}} onClick={this.popupReset.bind(this)}>Reset</button>
            <b>Round: {this.state.position.round}<br/>Turn: {this.state.position.turn}</b>
          </div>
          <div style={{marginLeft: '90px'}}>
            {this.state.Initiative.map((slot)=>
              <div style={{display: 'inline-block', height: '50px', width:'50px'}} key={slot.key}>
                <div style={{position: 'absolute'}}>
                {slot.bonusDie.reverse().map((type)=>
                  <img src={`/images/${type}.png`} alt={type} key={this.genKey()} className='tinydie' />
                )}
                </div>
              <img title='Click to Modify Initiative Slot' src={`/images/${slot.type}.png`} alt={slot.type} className='tokens' style={{height: '45px', width:'45px'}} onClick={this.popupModifyInitiativeSlot.bind(this, slot, 'current')} />
              </div>
            )}
            <img src={`/images/repeat.png`} alt='' className='tokens' style={{height: '45px', width:'45px'}}/>
            {this.state.InitiativePast.map((slot)=>
              <div style={{display: 'inline-block', height: '50px', width:'50px'}} key={slot.key}>
              <div style={{position: 'absolute'}}>
              {slot.bonusDie.reverse().map((type)=>
                <img src={`/images/${type}.png`} alt={type} key={this.genKey()} className='tinydie' />
              )}
              </div>
              <img title='Click to Modify Initiative Slot' src={`/images/${slot.type}.png`} alt={slot.type} className='tokens' style={{height: '45px', width:'45px'}} onClick={this.popupModifyInitiativeSlot.bind(this, slot, 'past')} />
              </div>
            )}
          </div>
        </div>
        <button title='Click to Show/Hide Initiative Tracker' type="button" style={{margin: '0.5em', fontSize: '14px', height: '15px', width: '55px'}}onClick={this.slideOut.bind(this)} className='lrgButton'>Initiative</button>
    </div>
    );
  }
}
  export default Initiative;
