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
      rollRef: firebase.database().ref().child(`${channel}`).child('roll'),
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      showOptions: 'none',
      optionsRef: firebase.database().ref().child(`${channel}`).child('options')
    };
  }

  componentDidMount() {
    this.reset();
    this.state.rollRef.on('value', snap => {
      this.setState({
        diceRoll: snap.val()
        });
      });
    this.state.optionsRef.on('value', snap => {
      this.setState({
        showOptions: snap.val()
        });
      });
  }

  addDie(diceColor) {
    this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]+1);
  }
  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]-1);
    }
  }
  reset() {
    this.state.rollRef.set({yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0});
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
    this.state.optionsRef.set('none');
  }
  expandExtras() {
    if (diceOrder.length < 8) {
      diceOrder.push('success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside');
      this.state.rollRef.set({yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0});
    } else {
      this.reset();
    }
  }


  dropMenu() {
    if (this.state.showOptions !== 'none'){
      this.state.optionsRef.set('none');
    } else {
      this.state.optionsRef.set('block');
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
  }

  roll() {
      var message = rolldice.roll(this.state.diceRoll, this.refs.polyhedral.value, diceOrder, symbols, symbolOrder, user);
      this.state.messageRef.push().set(message);

      if (this.refs.resetCheck.checked === false){
        this.reset()
      }
    }


  render() {
    return (
      <div style={{width:550}}>
      {diceOrder.map((diceColor) =>
        <div key={diceColor} className='dice-box' style={{marginLeft:6}}>
          <div style={{float: 'left', marginLeft: 0, padding: 0}}>
            <button className='btnAdd' onClick={this.addDie.bind(this, diceColor)}>⬆</button>
            <button className='btnAdd' onClick={this.removeDie.bind(this, diceColor)}>⬇</button>
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
          <button className='btnAdd' onClick={this.addDie.bind(this, 'polyhedral')}>⬆</button>
          <button className='btnAdd' onClick={this.removeDie.bind(this, 'polyhedral')}>⬇</button>
        </div>
        <div className='dice-amount' style={{float: 'left', marginLeft: 10}}> {this.state.diceRoll.polyhedral} </div>
        <div>
          <input className='textinput' style={{float: 'left', marginLeft: 15, width: '3em', textAlign: 'center', margin: '15px 0px 15px 25px'}} ref='polyhedral' defaultValue='100' />
        </div>
      </div>
      <input type='button' ref='extras' className='lrgButton' style={{verticalAlign:'bottom'}} onClick={this.expandExtras.bind(this)} value='Symbols' />

      <div />

      <div className='App'>
        <input type='button' ref='roll' className='lrgButton' onClick={this.roll.bind(this)} value='Roll' />
        <input type='button' ref='reset' className='lrgButton' style={{background: '#9e9e9e'}} onClick={this.reset.bind(this)} value='Reset' />
        <input type='button' ref='specialRollsDropDown' onClick={this.dropMenu.bind(this)} className='lrgButton' style={{width: '100px'}} value='Special Rolls'/>
        <label><input type="checkbox" ref='resetCheck' /> Save previous dice pool</label>
      </div>
      <div className='App' style={{display: this.state.showOptions}}>
        <form onSubmit={this.critical.bind(this, 'critical')}>
          <button className='lrgButton' style={{width: '100px'}}>Critical</button>
          <input className='textinput' ref='modifier' name='modifier' placeholder='modifier' style={{width: '70px', paddingLeft: '5px'}}/>
        </form>
        <form onSubmit={this.critical.bind(this, 'shipcritical')}>
          <button className='lrgButton' style={{width: '100px'}}>Ship Critical</button>
        </form>
      </div>
    </div>
    );
  }
}
  export default Dice;
