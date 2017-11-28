import React, { Component } from 'react';
import * as firebase from 'firebase';
import '../index.css';
var rolldice = require("./roll.js"),
    dice = require("./misc.js").dice,
    user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase(),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

class modifyDicePool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0},
      modifiedRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    let rebuilt = this.props.rebuilt;
    Object.keys(rebuilt.diceRoll).forEach((color)=>{
      diceRoll[color] = rebuilt.diceRoll[color]
    })
    this.setState({diceRoll});
    this.refs.caption.value = rebuilt.caption;
    this.refs.polyhedral.value = rebuilt.polyhedral;
  }

  addDie(diceColor) {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
    modifiedRoll[diceColor] += 1;
    diceRoll[diceColor] += 1;
    this.setState({modifiedRoll});
    this.setState({diceRoll});
  }

  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      let diceRoll = Object.assign({}, this.state.diceRoll);
      diceRoll[diceColor] -= 1;
      this.setState({diceRoll});
    }
    let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
    modifiedRoll[diceColor] -= 1;
    this.setState({modifiedRoll});
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

  roll() {
      let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
      let diceResult = this.props.rollResults;
      diceResult.text = `<span> ${user} modified dice pool </span>`;
      Object.keys(modifiedRoll).forEach((color)=>{
        //removes dice from the pool
        if (modifiedRoll[color] < 0) diceResult.roll[color] = this.deleteDie(modifiedRoll[color], diceResult.roll[color], color);

        //add dice to the Pool
        if (modifiedRoll[color] > 0) diceResult.roll[color] = this.addDice(modifiedRoll[color], diceResult.roll[color], color);
      });
      diceResult = rolldice.countSymbols(diceResult, user);
      if (this.refs.caption.value !== '') {
        diceResult.caption = this.refs.caption.value;
        diceResult.text += `<span> ${this.refs.caption.value} </span>`;
      }
      if (diceResult.text !== undefined) this.state.messageRef.push().set(diceResult);
      this.props.popupClose();
     }

  addDice(modifiedRoll, diceResult, color) {
    if (diceResult === undefined) diceResult = [];
    if (color === 'polyhedral') diceResult = diceResult.concat(rolldice.rollPolyhedral({polyhedral: modifiedRoll}, this.refs.polyhedral.value));
    else {
      for (let i=0; modifiedRoll[color]>i; i++) {
        diceResult.push(rolldice.rollDice(color));
      }
    }
    return diceResult;
  }

  deleteDie(modifiedRoll, diceResult, color) {
    if (modifiedRoll+diceResult.length===0) diceResult = [];
    else {
      for(var i=0; i>modifiedRoll; i--) {
        diceResult.splice(dice(diceResult.length)-1, 1)
      }
    }
    return diceResult;
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
      </div>
    </div>
    );
  }
}
export default modifyDicePool;
