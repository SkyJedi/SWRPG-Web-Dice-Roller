import React, { Component } from 'react';
//import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var diceTypes = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

class Dice extends Component {

  render() {
    return (
      <div style={{maxWidth:500}}>
      {diceTypes.map((diceColor) =>
        <div className='dice-box' style={{marginLeft:6}}>
          <div style={{float: 'left', marginLeft: 2, padding: 0}}>
            <button className='btnAdd'>⬆</button>
            <button className='btnAdd'>⬇</button>
          </div>
          <div className='dice-amount' style={{float: 'left', marginLeft: 15}}>
            <span>3</span>
          </div>
          <div className='dice-container' style={{float: 'left', marginLeft: 3}}>
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
          <button className='btnAdd'>⬆</button>
          <button className='btnAdd'>⬇</button>
        </div>
        <div className='dice-amount' style={{float: 'left', marginLeft: 15}}>
          <span>3</span>
        </div>
        <div className='dice-container' style={{float: 'left', marginLeft: 3}}>
        <input className='polyhedral' defaultValue='100' />
        </div>
      </div>
      <div className='App' style={{marginLeft:6}}>
        <input type='button' className='lrgButton' value='Roll' />
        <input type='button' className='lrgButton' style={{background: '#9e9e9e'}} value='Reset' />
      </div>
      </div>
    );
  }
}
  export default Dice;
