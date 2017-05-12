import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase(),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'],
    symbols = ['success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'],
    symbolOrder = ['s', 'a', '!', 'f', 't', 'd', 'l', 'n'];

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
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
  }
  expandExtras() {
    if (diceOrder.length < 8) {
      diceOrder.push('success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside');
      this.state.rollRef.set({yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0});
    } else {
      this.reset();
    }
  }

  printsymbols (number, symbol) {
    var message = '';
      for (var n = 0; number > n; n++){
        message += `<img class=diceface src=/images/${symbol}.png /> `;
      }
      return message;
  }


  roll() {
    var diceFaces = {
          yellow: ['', 's', 's', 'ss', 'ss', 'a', 'sa', 'sa', 'sa', 'aa', 'aa', '!'],
          green: ['', 's', 's', 'ss', 'a', 'a', 'sa', 'aa'],
          blue: ['', '', 's', 'sa', 'aa', 'a'],
          red: ['', 'f', 'f', 'ff', 'ff', 't', 't', 'ft', 'ft', 'tt', 'tt', 'd'],
          purple: ['', 'f', 'ff', 't', 't', 't', 'tt', 'ft'],
          black: ['', '', 'f', 'f', 't', 't'],
          white: ['n', 'n', 'n', 'n', 'n', 'n', 'nn', 'l', 'l', 'll', 'll', 'll']
        },
        symbolFaces = {
          success: 's',
          advantage: 'a',
          triumph: '!',
          fail: 'f',
          threat: 't',
          despair: 'd',
          lightside: 'l',
          darkside: 'n'
        },
        rollResults = {},
        rolledDice = {},
        message = '',
        sides = '',
        rolledSymbols = {},
        polyhedralRoll = [];

      for (var i = 0; i < Object.keys(this.state.diceRoll).length; i++) {
        if (this.state.diceRoll[Object.keys(this.state.diceRoll)[i]] !== 0) {
          rolledDice[Object.keys(this.state.diceRoll)[i]] = Object.values(this.state.diceRoll)[i];
        }
      }

      if (Object.keys(rolledDice).length === 0) {
        return;
      }

      var color = '';
      for (var j = 0; j < Object.keys(diceFaces).length; j++) {
        color = diceOrder[j];
        var tempArry = [];
        for (var k = 0; k < rolledDice[color]; k++) {
            var diceSide = diceFaces[color][(Math.floor(Math.random() * diceFaces[color].length) + 1)-1]
            tempArry.push(diceSide);
            sides += diceSide
            message += `<img class=diceface src=/images/dice/${color}-${diceSide}.png /> `;
        }
        rollResults[color] = tempArry;
      }

      for (var o = 0; o < Object.keys(symbolFaces).length; o++) {
        color = symbols[o];
        tempArry = [];
        for (var p = 0; p < rolledDice[color]; p++) {
            tempArry.push(symbolFaces[color]);
            sides += symbolFaces[color];
            message += `<img class=diceface src=/images/${color}.png /> `;
        }
        rollResults[color] = tempArry;
      }

      for(var n = 0; n < rolledDice['polyhedral']; n++) {
        polyhedralRoll.push(Math.floor(Math.random() * this.refs.polyhedral.value + 1));
        message += polyhedralRoll[n] + ' ';
      }

      message += '</div> <div>';
      for(var l=0; symbolOrder.length > l; l++){
        var count = 0;
        for(var m=0; sides.length > m; m++){
          if(sides.charAt(m) === symbolOrder[l]){
          ++count;
          }
        }
        rolledSymbols[symbolOrder[l]] = count;
      }
      var number = 0;
      if (rolledSymbols['s'] > rolledSymbols['f']) {
        number = rolledSymbols['s'] - rolledSymbols['f'];
        message += this.printsymbols(number, 'success');
      } else {
        number = rolledSymbols['f'] - rolledSymbols['s'];
        message += this.printsymbols(number, 'fail');
      }
      if (rolledSymbols['a'] > rolledSymbols['t']) {
        number = rolledSymbols['a'] - rolledSymbols['t'];
        message += this.printsymbols(number, 'advantage');
      } else {
        number = rolledSymbols['t'] - rolledSymbols['a'];
        message += this.printsymbols(number, 'threat');
      }
      if (rolledSymbols['!'] !== 0) {
        number = rolledSymbols['!'];
        message += this.printsymbols(number, 'triumph');
      }
      if (rolledSymbols['d'] !== 0) {
        number = rolledSymbols['d'];
        message += this.printsymbols(number, 'despair');
      }
      if (rolledSymbols['l'] !== 0) {
        number = rolledSymbols['l'];
        message += this.printsymbols(number, 'lightside');
      }
      if (rolledSymbols['n'] !== 0) {
        number = rolledSymbols['n'];
        message += this.printsymbols(number, 'darkside');
      }

      this.state.messageRef.push().set(message);

      if (this.refs.resetCheck.checked === false){
        this.reset()
      }
    }


  render() {
    return (
      <div style={{maxWidth:500}}>
      {diceOrder.map((diceColor) =>
        <div key={diceColor} className='dice-box' style={{marginLeft:6}}>
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
      <input type='button' ref='extras' className='lrgButton' style={{verticalAlign:'text-bottom'}} onClick={this.expandExtras.bind(this)} value='Extras' />

      <div />

      <div className='App' style={{marginLeft:6}}>
        <input type='button' ref='roll' className='lrgButton' onClick={this.roll.bind(this)} value='Roll' />
        <input type='button' ref='reset' className='lrgButton' style={{background: '#9e9e9e'}} onClick={this.reset.bind(this)} value='Reset' />
        <label><input type="checkbox" ref='resetCheck' /> Save previous dice pool</label>
      </div>
      </div>
    );
  }
}
  export default Dice;
