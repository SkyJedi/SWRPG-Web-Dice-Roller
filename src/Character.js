import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var position, key;

class Character extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
      currentCharacter: '',
      incapacitated: 'none',
    };
  }

  componentDidMount() {
    this.state.characterRef.on('value', snap => {
      this.setState({
        character: snap.val()
        });
      if ((this.state.currentCharacter === '') && (this.state.character !== null)) {
        this.previous();
      }
    });
    position = 0;
  }

  setNew() {
    Popup.create({
        title: 'New Character',
        content:
        <div style={{textAlign: 'center'}}>
          <input className='textinput' style={{textAlign: 'center'}} id='charName' placeholder='Character Name' />
          <input className='textinput' style={{textAlign: 'center'}} id='maxWounds' placeholder='Max Wounds' />
          <input className='textinput' style={{textAlign: 'center'}} id='maxStrain' placeholder='Max Strain' />
          <input className='textinput' style={{textAlign: 'center'}} id='credits' placeholder='Credits' />
          <input className='textinput' style={{textAlign: 'center'}} id='imageURL' placeholder='Image URL' />
        </div>,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: () => {
                    let currentCharacter = {
                                  name: document.getElementById('charName').value,
                                  currentWounds: 0,
                                  maxWounds: document.getElementById('maxWounds').value,
                                  currentStrain: 0,
                                  maxStrain: document.getElementById('maxStrain').value,
                                  credits: document.getElementById('credits').value,
                                  imageURL: document.getElementById('imageURL').value,
                                };
                    if (currentCharacter['imageURL'] === '') {
                      currentCharacter['imageURL'] = '/images/crest.png';
                    }
                    this.state.characterRef.push().set(currentCharacter);
                    this.setState({currentCharacter});
                    Popup.alert(currentCharacter['name'] + ' has been successfully added!');
                    Popup.close();
                }
            }]

        }
    });
  }

  Remove() {
    this.getcurrentKey();
    if (Object.keys(this.state.character).length > 1) {
      this.state.characterRef.child(key).remove();
      this.previous();
    } else {
      this.state.characterRef.child(key).remove();
      this.setState({currentCharacter: {name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png'}});
    }
  }

  popupDeleteCharacter() {
    Popup.create({
    title: 'Delete Character',
    content: 'Are you sure, this will delete ' + this.state.currentCharacter['name'],
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.Remove();
              Popup.close();
            }
        }]
    }});
  }


  previous() {
    if (position - 1 < 0) {
      position = Object.keys(this.state.character).length-1;
    } else {
      position--;
    }
    let currentCharacter = this.state.character[Object.keys(this.state.character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  next() {
    if (position + 1 === Object.keys(this.state.character).length) {
      position = 0;
    } else {
      position++;
    }
    let currentCharacter = this.state.character[Object.keys(this.state.character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  checkIncap(currentCharacter) {
    if (currentCharacter['currentWounds'] >= currentCharacter['maxWounds']  || currentCharacter['currentStrain'] >= currentCharacter['maxStrain']) {
      this.setState({incapacitated: 'block'});
    } else {
      this.setState({incapacitated: 'none'});
    }
  }

  modifyStats(e) {
    e.preventDefault();
    this.getcurrentKey();
    var modifyStat = {
      currentWounds: this.refs.currentWounds.value,
      currentStrain: this.refs.currentStrain.value,
      credits: this.refs.credits.value
    };
    let currentCharacter = Object.assign({}, this.state.currentCharacter);
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
          modifier = +(modifier).replace(/\D/g, '');
        }
        currentCharacter[stat] = modifier;
    this.refs.currentWounds.blur();
    this.refs.currentStrain.blur();
    this.refs.credits.blur();
    this.refs.currentWounds.value = '';
    this.refs.currentStrain.value = '';
    this.refs.credits.value = '';
    this.setState({currentCharacter});
    this.state.characterRef.child(key).set(currentCharacter);
    this.checkIncap(currentCharacter);
    }
  }
}

  getcurrentKey() {
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
          <button className='btnAdd' onClick={this.setNew.bind(this)}>+</button>
          <button className='btnAdd' onClick={this.popupDeleteCharacter.bind(this)}>-</button>
          <button className='btnAdd' onClick={this.previous.bind(this)}>←</button>
          <button className='btnAdd' onClick={this.next.bind(this)}>→</button>
        </div>
        <div style={{lineHeight: '1.6'}}>
          <b style={{fontSize: '25px', color: 'black', textAlign: 'center', padding: '5px'}}>{this.state.currentCharacter['name']}</b>
          <br />
          <b style={{fontSize: '25px', color: 'red', display: this.state.incapacitated}}>Incapacitated</b>
        </div>

          <div style={{marginLeft: '70px', textAlign: 'left'}}>
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
