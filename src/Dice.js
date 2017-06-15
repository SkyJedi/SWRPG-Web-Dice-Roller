import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';
var crit = require("./functions/Crit.js");
var rolldice = require("./functions/Roll.js");


var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'],
    symbols = ['success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'],
    symbolOrder = ['s', 'a', '!', 'f', 't', 'd', 'l', 'n'];

class Dice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diceRoll: {},
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      showOptions: 'none',
      destinyRef: firebase.database().ref().child(`${channel}`).child('destiny'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
    };
  }

  componentDidMount() {
    this.reset();
  }

  addDie(diceColor) {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    diceRoll[diceColor] += 1;
    this.setState({diceRoll});
  }

  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      let diceRoll = Object.assign({}, this.state.diceRoll);
      diceRoll[diceColor] -= 1;
      this.setState({diceRoll});
    }
  }

  reset() {
    this.setState({diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
    this.setState({showOptions: 'none'});
    this.refs.caption.value = '';
  }

  expandExtras() {
    if (diceOrder.length < 8) {
      diceOrder.push('success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside');
      this.setState({diceRoll:{yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    } else {
      this.setState({diceRoll:{yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
      diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
    }
  }

  dropMenu() {
    if (this.state.showOptions !== 'none'){
      this.setState({showOptions: 'none'});
    } else {
      this.setState({showOptions: 'inline-block'});
    }
  }

  critical(critical, stop) {
    stop.preventDefault();
    var critRoll = crit.d100(this.refs.modifier.value);
    var critText = ''
    if (critical === 'critical') {
      critText = crit.crit(critRoll[0]);
    } else {
      critText = crit.shipcrit(critRoll[0]);
    }
    critText = user + ' ' + critRoll[1] + `<p>` + critText + `</p>`
    this.state.messageRef.push().set(critText);
    this.refs.modifier.value = '';

  }

  roll() {
      var message = rolldice.roll(this.state.diceRoll, this.refs.polyhedral.value, this.refs.caption.value, diceOrder, symbols, symbolOrder, user)[0];
      if (message !== undefined) {
        this.state.messageRef.push().set(message);
      }
      if (this.refs.resetCheck.checked === false){
        this.setState({diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
        this.refs.caption.value = '';
        this.refs.polyhedral.value = 100;
      }

     }

  destinyRoll(){
    var destinyResult = rolldice.roll({white:1}, this.refs.polyhedral.value, '', diceOrder, symbols, symbolOrder, user);
    var message = destinyResult[0] + `<br/> Adding to the Destiny Pool`;
    destinyResult = destinyResult[1]['white'][0];
    switch(destinyResult) {
      case 'l':
        this.state.destinyRef.push().set('lightside');
        break;
      case 'll':
        this.state.destinyRef.push().set('lightside');
        this.state.destinyRef.push().set('lightside');
        break;
      case "n":
        this.state.destinyRef.push().set('darkside');
        break;
      case 'nn':
        this.state.destinyRef.push().set('darkside');
        this.state.destinyRef.push().set('darkside');
        break;
      default:
        break;
    }
    this.state.messageRef.push().set(message);
    this.refs.caption.value = '';
    this.refs.polyhedral.value = 100;
  }

  initiativeRoll() {
    var initiativeResult = rolldice.roll(this.state.diceRoll, this.refs.polyhedral.value, this.refs.caption.value, diceOrder, symbols, symbolOrder, user);
    if (initiativeResult === 0){return;}
    var message = initiativeResult[0];
    var initiativeRoll = initiativeResult[2];
    var newInit = {};
    newInit.roll = (initiativeRoll.s - initiativeRoll.f).toString() + (initiativeRoll.a - initiativeRoll.t).toString() + initiativeRoll['!'].toString();
    newInit.bonusDie = {blue: 0, black: 0};
    if (this.refs.pcCheck.checked === false) {
      newInit.type = 'PC'
      newInit.roll += '1'
    } else {
      newInit.type = 'NPC'
      newInit.roll += '0'
    }
    this.state.InitiativeRef.push().set(newInit);
    if (message !== undefined) {
      this.state.messageRef.push().set(message);
    }
    if (this.refs.resetCheck.checked === false){
      this.setState({diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    }
    this.refs.caption.value = '';
    this.refs.polyhedral.value = 100;
  }


  render() {
    return (
      <div style={{topMargin: '5px', width: '525px'}}>
      {diceOrder.map((diceColor) =>
        <div key={diceColor} className='dice-box' style={{marginLeft:6}}>
          <div style={{float: 'left', marginLeft: 0, padding: 0}}>
            <button className='btnAdd' onClick={this.addDie.bind(this, diceColor)}>↑</button>
            <button className='btnAdd' onClick={this.removeDie.bind(this, diceColor)}>↓</button>
          </div>
          <div className='dice-amount' style={{float: 'left', marginLeft: 10}}> {this.state.diceRoll[diceColor]}</div>
          <div>
              <img
              className='dice'
              key={diceColor}
              style={{float: 'left', marginLeft: 15}}
              onClick={this.addDie.bind(this, diceColor)}
              src={`/images/${diceColor}.png`}
              alt={`${diceColor}`} />
          </div>
        </div>
      )}
      <div className='dice-box' style={{marginLeft:6}}>
        <div style={{float: 'left', marginLeft: 2, padding: 0}}>
          <button className='btnAdd' onClick={this.addDie.bind(this, 'polyhedral')}>↑</button>
          <button className='btnAdd' onClick={this.removeDie.bind(this, 'polyhedral')}>↓</button>
        </div>
        <div className='dice-amount' style={{float: 'left', marginLeft: 10}}> {this.state.diceRoll.polyhedral} </div>
        <div>
          <input className='textinput' style={{float: 'left', marginLeft: 15, width: '3em', textAlign: 'center', margin: '15px 0px 15px 25px'}} ref='polyhedral' defaultValue='100' />
        </div>
      </div>
      <input type='button' ref='extras' className='lrgButton' style={{verticalAlign:'bottom', margin: '5px'}} onClick={this.expandExtras.bind(this)} value='Symbols' />

      <div />

      <div style={{display: 'inline-block'}}>
        <input type='button' ref='roll' className='lrgButton' onClick={this.roll.bind(this)} value='Roll' />
        <input className='textinput' ref='caption' name='caption' placeholder='caption' style={{width: '70px', paddingLeft: '5px'}}/>
        <input type='button' ref='reset' className='lrgButton' style={{background: '#9e9e9e'}} onClick={this.reset.bind(this)} value='Reset' />
        <input type='button' ref='specialRollsDropDown' onClick={this.dropMenu.bind(this)} className='lrgButton' style={{width: '100px'}} value='Special Rolls'/>
        <label className='switch'><input type='checkbox' ref='resetCheck'/><div className='slider round'></div></label>&nbsp;<span>Save Pool</span>
      </div>
      <div style={{display: this.state.showOptions}}>
        <form>
          <button onClick={this.critical.bind(this, 'critical')} className='lrgButton' style={{width: '100px'}}>Critical</button>
          <button onClick={this.critical.bind(this, 'shipcrit')}className='lrgButton' style={{width: '100px'}}>Ship Critical</button>
          <input className='textinput' ref='modifier' name='modifier' placeholder='modifier' style={{width: '70px', paddingLeft: '5px'}}/>
        </form>
          <input type='button' style={{width: '100px'}} ref='destinyRoll' className='lrgButton' onClick={this.destinyRoll.bind(this)} value='Roll Destiny' />
          <br/>
          <input type='button' style={{width: '100px'}} ref='initiativeRoll' className='lrgButton' onClick={this.initiativeRoll.bind(this)} value='Roll Initiative' />
          &nbsp;<span>PC</span>&nbsp;
          <label className='switch'><input type='checkbox' ref='pcCheck'/><div className='slider round'></div></label>&nbsp;
          <span>NPC</span>
      </div>
      <div/>
    </div>
    );
  }
}
  export default Dice;
