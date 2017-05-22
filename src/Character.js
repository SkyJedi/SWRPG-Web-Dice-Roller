import React, { Component } from 'react';
import Popup from 'react-popup';
import Popups from './functions/Popups.js';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var position, key;
var setIncap = {
    wounds: false,
    strain: false
  };

class Character extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
      currentCharacter: {},
      currentCharacterRef: firebase.database().ref().child(`${channel}`).child('currentCharacter'),
    };
  }

  componentDidMount() {
    this.state.characterRef.on('value', snap => {
      this.setState({
        character: snap.val()
        });
      });
    this.state.currentCharacterRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        currentCharacter: snap.val()
        });
      } else {
        this.setState({
          currentCharacter: {name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png', incapacitated: '#ecf0f1'}
          });
      }
    });
    position = 0;
  }

  setNew() {
    Popup.queue(Popups.characterPop);
  }

  Remove() {
    this.getcurrenyKey();
    if (Object.keys(this.state.character).length > 1) {
      this.state.characterRef.child(key).remove();
      this.state.currentCharacterRef.remove();
      this.previous();
    } else {
      this.state.characterRef.child(key).remove();
      this.state.currentCharacterRef.set({name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png', incapacitated: '#ecf0f1'});
    }
  }

  popupChange(stat) {
    Popup.queue(Popups.popupURLChange);

  }

  previous() {
    if (position - 1 < 0) {
      position = Object.keys(this.state.character).length-1;
    } else {
      position--;
    }
    key = Object.keys(this.state.character)[position];
    this.state.currentCharacterRef.set(this.state.character[key]);
  }

  next() {
    if (position + 1 === Object.keys(this.state.character).length) {
      position = 0;
    } else {
      position++;
    }
    key = Object.keys(this.state.character)[position];
    this.state.currentCharacterRef.set(this.state.character[key]);
  }

  modifyStats(e) {
    e.preventDefault();
    this.getcurrenyKey();
    var modifyStat = {
      currentWounds: this.refs.currentWounds.value,
      currentStrain: this.refs.currentStrain.value,
      credits: this.refs.credits.value
    };
    for (var j = 0; j < Object.keys(modifyStat).length; j++) {
      var stat = Object.keys(modifyStat)[j];
      var modifier = modifyStat[stat];
      if (modifier !== '') {
        var message ='';
        if (modifier.includes('+')) {
          message += 'adding stat';
          modifier = (modifier).replace(/\D/g, '');
          modifier = +this.state.currentCharacter[stat] + +modifier;
      	//subtraction modifier
        } else if (modifier.includes('-')) {
          modifier = (modifier).replace(/\D/g, '');
          message += 'subtract stat';
          modifier = +this.state.currentCharacter[stat] - +modifier;
        } else {
          modifier = (modifier).replace(/\D/g, '');
        }
        if (stat === 'currentWounds' && +modifier >= +this.state.currentCharacter['maxWounds']) {
          setIncap['wounds'] = true;
        }
        if (stat === 'currentWounds' && +modifier < +this.state.currentCharacter['maxWounds']) {
          setIncap['wounds'] = false;
        }
        if (stat === 'currentStrain' && +modifier >= +this.state.currentCharacter['maxStrain']) {
          setIncap['strain'] = true;
        }
        if (stat === 'currentStrain' && +modifier < +this.state.currentCharacter['maxStrain']) {
          setIncap['strain'] = false;
        }
        console.log(modifier >= this.state.currentCharacter['maxWounds']);
        console.log(modifier);
        console.log(stat);
        console.log(setIncap);

        this.state.currentCharacterRef.child(stat).set(modifier);
        this.state.characterRef.child(key).child(stat).set(modifier);
      }
    }
    this.checkIncap();
    this.refs.currentWounds.blur();
    this.refs.currentStrain.blur();
    this.refs.credits.blur();
    this.refs.currentWounds.value = '';
    this.refs.currentStrain.value = '';
    this.refs.credits.value = '';
  }

  checkIncap() {
    if (setIncap['wounds'] === true || setIncap['strain'] === true) {
      this.state.currentCharacterRef.child('incapacitated').set('red');
      this.state.characterRef.child(key).child('incapacitated').set('red');
    } else {
      this.state.currentCharacterRef.child('incapacitated').set('#ecf0f1');
      this.state.characterRef.child(key).child('incapacitated').set('#ecf0f1');
    }
  }
  getcurrenyKey() {
    for (var i = 0; i < Object.keys(this.state.character).length; i++) {
      if (JSON.stringify(this.state.character[Object.keys(this.state.character)[i]]) === JSON.stringify(this.state.currentCharacter)) {
        key = Object.keys(this.state.character)[i];
        break;
      }
    }
  }


  render() {
    return (


      <div className='dice-box' style={{margin: '5px', marginTop: '40px', Width: '350px', minHeight: '225px', display: 'block', textAlign: 'center'}}>
        <img className='characterimage' ref='imageURL' style={{float: 'right', marginRight: '5px'}} src={this.state.currentCharacter['imageURL']} alt=''/>

        <div style={{float: 'left'}}>
          <button className='btnAdd' style={{width: '50px'}} onClick={this.setNew.bind(this)}>+</button>
          <button className='btnAdd' style={{width: '50px'}} onClick={this.Remove.bind(this)}>-</button>
          <button className='btnAdd' style={{width: '50px'}} onClick={this.previous.bind(this)}>←</button>
          <button className='btnAdd' style={{width: '50px'}} onClick={this.next.bind(this)}>→</button>
        </div>
        <div style={{lineHeight: '1.6'}}>
          <b style={{fontSize: '25px', color: 'black', textAlign: 'center', padding: '5px'}}>{this.state.currentCharacter['name']}</b>
          <br />
          <b style={{fontSize: '25px', color: this.state.currentCharacter['incapacitated'], display: 'block'}}>Incapacitated</b>
        </div>

          <div style={{float: 'right', marginLeft: '10px', textAlign: 'left'}}>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentWounds' placeholder={this.state.currentCharacter['currentWounds']} style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}>/ {this.state.currentCharacter['maxWounds']} Wounds</b>
            </form>
            </div>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentStrain' placeholder={this.state.currentCharacter['currentStrain']} style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}>/ {this.state.currentCharacter['maxStrain']} Strain</b>
              </form>
            </div>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='credits' placeholder={this.state.currentCharacter['credits']} style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}> Credits</b>
              <button className='btnAdd' style={{width: '75px', marginLeft:'40px', display: 'inline-block'}}>Update</button>
              </form>
            </div>
          </div>

      </div>

    )
  }
}
  export default Character;
