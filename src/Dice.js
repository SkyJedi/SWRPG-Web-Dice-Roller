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
    this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]+1);
  }
  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      this.state.rollRef.child(diceColor).set(this.state.diceRoll[diceColor]-1);
    }
  }
  reset() {
    this.state.rollRef.set({yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0});
  }

  roll() {
    var diceFaces = {
        yellow: ['', 's', 's', 'ss', 'ss', 'a', 'sa', 'sa', 'sa', 'aa', 'aa', 't'],
        green: ['', 's', 's', 'ss', 'a', 'a', 'sa', 'aa'],
        blue: ['', '', 's', 'sa', 'aa', 'a'],
        red: ['', 'f', 'f', 'ff', 'ff', 't', 't', 'ft', 'ft', 'tt', 'tt', 'd'],
        purple: ['', 'f', 'ff', 't', 't', 't', 'tt', 'ft'],
        black: ['', '', 'f', 'f', 't', 't'],
        white: ['n', 'n', 'n', 'n', 'n', 'n', 'nn', 'l', 'l', 'll', 'll', 'll']
        },
        rollResults = {},
        rolledDice = {};

      for (var i = 0; i < Object.keys(this.state.diceRoll).length; i++) {
        if (this.state.diceRoll[Object.keys(this.state.diceRoll)[i]] !== 0) {
          rolledDice[Object.keys(this.state.diceRoll)[i]] = Object.values(this.state.diceRoll)[i];
        }
      }
      console.log(rolledDice);

      var color = '';
      var tempArry = [];
      for (var j = 0; j < Object.keys(rolledDice).length; j++) {
        color = Object.keys(rolledDice)[j];
        tempArry = [];
        for (var k = 0; k < rolledDice[color]; k++) {
            tempArry.push(diceFaces[color][(Math.floor(Math.random() * diceFaces[color].length) + 1)-1]);
        }
        rollResults[color] = tempArry;
      }
      console.log(rollResults);



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
        <input type='button' ref='roll' className='lrgButton' onClick={this.roll.bind(this)} value='Roll' />
        <input type='button' ref='reset' className='lrgButton' style={{background: '#9e9e9e'}} onClick={this.reset.bind(this)} value='Reset' />
      </div>
      </div>
    );
  }
}
  export default Dice;
