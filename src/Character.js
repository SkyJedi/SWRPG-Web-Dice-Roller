import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';
const dice = require("./functions/misc.js").dice;

var channel = window.location.pathname.slice(1).toLowerCase();


class Character extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
      currentCharacter: {name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png'},
      incapacitated: 'none',
    };
  }

  componentDidMount() {
    this.state.characterRef.on('value', snap => {
      if (snap.val() !== null) {
        this.setState({character: snap.val()}, function() {
          if (this.state.currentCharacter.name === 'No Characters') {
            this.setState({currentCharacter: snap.val()[Object.keys(snap.val())[0]]});
          } else {
            this.setState({currentCharacter: snap.val()[this.getcurrentKey()]});
          }
        });
      } else {
        this.setState({character: {}});
      }
    });
  }

  setNew() {
    Popup.create({
        title: 'New Character',
        className: 'character',
        content:
        <div style={{textAlign: 'center'}}>
          <input className='textinput' style={{textAlign: 'center'}} id='charName' placeholder='Character Name' />
          <input className='textinput' type='number' style={{textAlign: 'center'}} id='maxWounds' placeholder='Max Wounds' />
          <input className='textinput' type='number' style={{textAlign: 'center'}} id='maxStrain' placeholder='Max Strain' />
          <input className='textinput' type='number' style={{textAlign: 'center'}} id='credits' placeholder='Credits' />
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
                                  key: this.genKey(),
                                  init: '',
                                  dice:  {blue: '', black: '', upgrade: '', downgrade: ''},
                                };
                    if (currentCharacter['imageURL'] === '') {
                      currentCharacter['imageURL'] = '/images/crest.png';
                    }
                    this.state.characterRef.push().set(currentCharacter);
                    this.setState({currentCharacter: currentCharacter});
                    this.state.messageRef.push().set({text: currentCharacter['name'] + ' has been successfully added!'});
                    Popup.close();
                }
            }]

        }
    });
  }

  editCharacter() {
    Popup.create({
        title: 'Edit Character',
        className: 'character',
        content:
        <div>
        <div style={{fontSize: '20px', float: 'left', lineHeight: '2.2', textAlign: 'right'}}>
          <span style={{padding: '10px 0'}}>Character Name</span><br/>
          <span style={{padding: '10px 0'}}>Max Wounds</span><br/>
          <span style={{padding: '10px 0'}}>Max Strain</span><br/>
          <span style={{padding: '10px 0'}}>Credits</span><br/>
          <span style={{padding: '10px 0'}}>imageURL</span><br/>
        </div>
        <div style={{marginLeft: '135px'}}>
          <input className='textinput' style={{textAlign: 'center', width: '7em'}} id='charName' defaultValue={this.state.currentCharacter['name']} /><br/>
          <input className='textinput' type='number' style={{textAlign: 'center', width: '7em'}} id='maxWounds' defaultValue={this.state.currentCharacter['maxWounds']} /><br/>
          <input className='textinput' type='number' style={{textAlign: 'center', width: '7em'}} id='maxStrain' defaultValue={this.state.currentCharacter['maxStrain']} /><br/>
          <input className='textinput' type='number' style={{textAlign: 'center', width: '7em'}} id='credits' defaultValue={this.state.currentCharacter['credits']} /><br/>
          <input className='textinput' style={{textAlign: 'center', width: '7em'}} id='imageURL' defaultValue={this.state.currentCharacter['imageURL']} /><br/>
        </div>
        </div>,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: () => {
                    let currentCharacter = {
                                  name: document.getElementById('charName').value,
                                  currentWounds: this.state.currentCharacter['currentWounds'],
                                  maxWounds: document.getElementById('maxWounds').value,
                                  currentStrain: this.state.currentCharacter['currentStrain'],
                                  maxStrain: document.getElementById('maxStrain').value,
                                  credits: document.getElementById('credits').value,
                                  imageURL: document.getElementById('imageURL').value,
                                  key: this.state.currentCharacter['key'],
                                  init: this.state.currentCharacter['init'],
                                  dice: this.state.currentCharacter['dice'],
                                };
                    if (currentCharacter['imageURL'] === '') {
                      currentCharacter['imageURL'] = '/images/crest.png';
                    }
                    this.state.characterRef.child(this.getcurrentKey()).set(currentCharacter);
                    this.checkIncap(currentCharacter);
                    this.setState({currentCharacter: currentCharacter});
                    this.state.messageRef.push().set({text: currentCharacter['name'] + ' has been successfully edited!'});
                    Popup.close();
                }
            }]

        }
    });
  }

  Remove() {
    if (this.state.currentCharacter.name === 'No Characters') return;
    if (Object.keys(this.state.character).length > 1) {
      this.state.characterRef.child(this.getcurrentKey()).remove();
      this.state.messageRef.push().set({text: this.state.currentCharacter['name'] + ' has been removed.'});
      this.previous();
    } else {
      this.state.messageRef.push().set({text: this.state.currentCharacter['name'] + ' has been removed.'});
      this.state.characterRef.remove();
      this.setState({currentCharacter: {name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png'}});
    }
  }

  popupDeleteCharacter() {
    Popup.create({
    title: 'Delete Character',
    className: 'character',
    content: 'Are you sure, this will delete ' + this.state.currentCharacter['name'],
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
    if (this.state.currentCharacter.name === 'No Characters') return;
    let position = this.getPosition();
    let character = Object.assign({}, this.state.character);
    if (position - 1 < 0) {
      position = Object.keys(character).length-1;
    } else {
      position--;
    }
    let currentCharacter = character[Object.keys(character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  next() {
    if (this.state.currentCharacter.name === 'No Characters') return;
    let position = this.getPosition()
    if (position + 1 === Object.keys(this.state.character).length) {
      position = 0;
    } else {
      position++;
    }
    let currentCharacter = this.state.character[Object.keys(this.state.character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  modifyStats(e) {
    e.preventDefault();
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
        var message = currentCharacter['name'];
        if (modifier.includes('+')) {
          if (stat === 'credits') message += ' earns ';
          else message += ' takes ';
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +this.state.currentCharacter[stat] + +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));
      	//subtraction modifier
        } else if (modifier.includes('-')) {
          if (stat === 'credits') {message += ' spends '}
          else {message += ' recovers '}
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +this.state.currentCharacter[stat] - +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));

        } else {
          modifier = +(modifier).replace(/\D/g, '');
          if (stat === 'credits') message += (' ' + stat + ' set to ' + modifier);
          else message += (' ' + stat.slice(7).toLowerCase() + ' set to ' + modifier);
        }
        if (modifier < 0) modifier = 0;
        currentCharacter[stat] = modifier;
    this.refs.currentWounds.blur();
    this.refs.currentStrain.blur();
    this.refs.credits.blur();
    this.refs.currentWounds.value = '';
    this.refs.currentStrain.value = '';
    this.refs.credits.value = '';
    this.state.characterRef.child(this.getcurrentKey()).set(currentCharacter);
    this.checkIncap(currentCharacter);
    this.state.messageRef.push().set({text: message});

    }
  }
}

  addBonusDice(k) {
    let character = Object.assign({}, this.state.character);
    Popup.create({
    title: 'Add Bonus Dice',
    className: 'character',
    content: 'Which die would you like to give ' + character[k].name + '?',
    buttons: {
        left: [{
          text: 'Bonus',
          className: 'bonus',
          action: () => {
            character[k].dice.blue += "<img src='/images/blue.png' alt='blue.png' style='height: 15px' width: 15px;'/>"
            this.state.characterRef.set(character);
            Popup.close();
          }
        }, {
          text: 'Setback',
          className: 'setback',
          action: () => {
            character[k].dice.black += "<img src='/images/black.png' alt='black.png' style='height: 15px; width: 15px;'/>"
            this.state.characterRef.set(character);
            Popup.close();
          }
        }  ],
        right: [{
              text: 'Upgrade',
              className: 'upgrade',
              action: () => {
                character[k].dice.upgrade += "<img src='/images/upgrade.png' alt='upgrade.png' style='height: 15px' width: 15px;'/>"
                this.state.characterRef.set(character);
                Popup.close();
              }
          }, {
            text: 'Downgrade',
            className: 'downgrade',
            action: () => {
              character[k].dice.downgrade += "<img src='/images/downgrade.png' alt='downgrade.png' style='height: 15px' width: 15px;'/>"
              this.state.characterRef.set(character);
              Popup.close();
            }
        },]
    }});

  }

  selectCharacter(key) {
    let currentCharacter = this.state.character[key];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  checkIncap(currentCharacter) {
    if (currentCharacter['currentWounds'] > currentCharacter['maxWounds']  || currentCharacter['currentStrain'] > currentCharacter['maxStrain']) {
      this.setState({incapacitated: 'block'});

    } else {
      this.setState({incapacitated: 'none'});
    }
  }

  initClick(key) {
    let character = this.state.character[key];
    switch (character.init) {
      case 'X':
        character.init = '';
        break;
      case '':
        character.init = 'X'
        character.dice = {blue: '', black: '', upgrade: '', downgrade:''};
        break;
      default:
        character.init = ''
    }
    this.state.characterRef.child(key).set(character);
  }

  getcurrentKey() {
    let currentCharacter = Object.assign({}, this.state.currentCharacter);
    let character = Object.assign({}, this.state.character);
    for (var i = 0; i < Object.keys(character).length; i++) {
      if (character[Object.keys(character)[i]]['key'] === currentCharacter.key) {
        return Object.keys(character)[i];
      }
    }
  }

  getPosition() {
    let currentCharacter = Object.assign({}, this.state.currentCharacter);
    let character = Object.assign({}, this.state.character);
    if (Object.keys(currentCharacter).length === 0) return 0;
    for (var i = 0; i < Object.keys(character).length; i++) {
      if (character[Object.keys(character)[i]]['key'] === currentCharacter.key) {
        return i;
      }
    }
  }

  genKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 15; i++ )
        text += possible.charAt(dice(possible.length)-1);
    return text;
  }

  render() {
    return (
      <div className='dice-box' style={{margin: '5px', marginTop: '40px', height: 'auto', display: 'block', textAlign: 'center'}}>
        <img className='characterimage' ref='imageURL' onClick={this.editCharacter.bind(this)} style={{float: 'right', marginRight: '5px'}} src={this.state.currentCharacter['imageURL']} alt=''/>
        <div style={{float: 'left'}}>
          <button className='btnAdd' onClick={this.setNew.bind(this)}>+</button>
          <button className='btnAdd' onClick={this.popupDeleteCharacter.bind(this)}>-</button>
          <button className='btnAdd' onClick={this.next.bind(this)}>→</button>
          <button className='btnAdd' onClick={this.previous.bind(this)}>←</button>
          <button onClick={this.modifyStats.bind(this)} className='btnAdd' style={{fontSize: '12px'}}>Set</button>
        </div>
        <table style={{margin: '10px 0 10px 80px'}}>
          <thead>
            <tr><td colSpan='2' style={{textAlign: 'center'}}><b style={{fontSize: '20px', color: 'black', textAlign: 'center', padding: '5px'}}>{this.state.currentCharacter['name']}</b></td></tr>
          </thead>
          <tbody>
          <tr><td colSpan='2' style={{textAlign: 'center'}}><b style={{fontSize: '20px', color: 'red', display: this.state.incapacitated}}>Incapacitated</b></td></tr>
          <tr>
            <td><form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentWounds' placeholder={this.state.currentCharacter['currentWounds']} style={{width: '50px', textAlign: 'center', height: 'auto', fontSize: '15px'}}/></form></td>
            <td style={{textAlign: 'left'}}><b style={{fontSize: '16px', color: 'Black'}}>/{this.state.currentCharacter['maxWounds']} Wounds</b></td>
          </tr>
          <tr>
            <td><form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentStrain' placeholder={this.state.currentCharacter['currentStrain']} style={{width: '50px', textAlign: 'center', height: 'auto', fontSize: '15px'}}/></form></td>
            <td style={{textAlign: 'left'}}><b style={{fontSize: '16px', color: 'Black'}}>/{this.state.currentCharacter['maxStrain']} Strain</b></td>
          </tr>
          <tr>
            <td><form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='credits' placeholder={this.state.currentCharacter['credits']} style={{width: '50px', textAlign: 'center', height: 'auto', fontSize: '15px'}}/></form></td>
            <td style={{textAlign: 'left'}}><b style={{fontSize: '16px', color: 'Black'}}> Credits</b></td>
          </tr>
          </tbody>
        </table>
        <div >
        <table style={{fontSize:'15px', width: '100%', borderCollapse: 'collapse', padding: '2px 0 2px 0', borderRadius: '1px'}}>
        <thead><tr><td><b>Init</b></td><td><b>Name</b></td><td><b>Wound</b></td><td><b>Strain</b></td><td><b>Dice</b></td></tr></thead>
        <tbody>
        {Object.keys(this.state.character).map((k) =>
          <tr style={{textAlign: 'left', border: 'solid #969595 1px'}} key={k}><td onClick={this.initClick.bind(this, k)}>{this.state.character[k].init}</td><td onClick={this.selectCharacter.bind(this, k)}><b>{this.state.character[k].name}</b></td><td onClick={this.selectCharacter.bind(this, k)}>&nbsp;{this.state.character[k].currentWounds}/{this.state.character[k].maxWounds}</td><td onClick={this.selectCharacter.bind(this, k)}>&nbsp;{this.state.character[k].currentStrain}/{this.state.character[k].maxStrain}</td><td onClick={this.addBonusDice.bind(this, k)}><div style={{display: 'inline-block'}} dangerouslySetInnerHTML={{ __html: this.state.character[k].dice.blue }} /><div style={{display: 'inline-block'}} dangerouslySetInnerHTML={{ __html: this.state.character[k].dice.black }} /><div style={{display: 'inline-block'}} dangerouslySetInnerHTML={{ __html: this.state.character[k].dice.upgrade }} /><div style={{display: 'inline-block'}} dangerouslySetInnerHTML={{ __html: this.state.character[k].dice.downgrade }} /></td></tr>
        )}
        </tbody>
        </table>
        </div>




      </div>
    )
  }
}
  export default Character;
