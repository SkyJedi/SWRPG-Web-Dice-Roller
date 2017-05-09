import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

class Dice extends Component {
  constructor() {
    super();
    this.state = {
      diceRoll: {},
      rollRef: firebase.database().ref().child(`${channel}`).child('roll'),
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.rollRef.set({yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0});
    this.state.rollRef.on('value', snap => {
      this.setState({
        diceRoll: snap.val()
        });
      });
  }

  addDie(diceColor) {
    console.log('adding to ' + diceColor);
    this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]+1);
    console.log(this.state.diceRoll[diceColor]);
  }
  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      console.log('removing from ' + diceColor);
      this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]-1);
      console.log(this.state.diceRoll[diceColor]);
    }
  }
  reset() {
    this.state.rollRef.set({yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0});
  }

  render() {
    return (
      <div style={{maxWidth:500}}>
      {diceOrder.map((diceColor) =>
        <div className='dice-box' style={{marginLeft:6}}>
          <div style={{float: 'left', marginLeft: 2, padding: 0}}>
          <button className='btnAdd' onClick={this.addDie.bind(this, diceColor)}>⬆</button>
          <button className='btnAdd' onClick={this.removeDie.bind(this, diceColor)}>⬇</button>
          </div>
          <div className='dice-amount' style={{float: 'left', marginLeft: 10}}>
            <span>{this.state.diceRoll[diceColor]}</span>
          </div>
          <div className='dice-container' style={{float: 'left', marginLeft: 15}}>
            <img
              className='dice'
              key={diceColor}
              style={{float: 'left', marginLeft: 3, width: 60}}
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
        <div className='dice-amount' style={{float: 'left', marginLeft: 10}}>
          <span>{this.state.diceRoll.polyhedral}</span>
        </div>
        <div className='dice-container' style={{float: 'left', marginLeft: 15}}>
        <input className='polyhedral' ref='polyhedral' defaultValue='100' />
        </div>
      </div>
      <div className='App' style={{marginLeft:6}}>
        <input type='button' ref='roll' className='lrgButton' value='Roll' />
        <input type='button' ref='reset' className='lrgButton' style={{background: '#9e9e9e'}} onClick={this.reset.bind(this)} value='Reset' />
      </div>
      </div>
    );
  }
}
  export default Dice;
