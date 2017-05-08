import React, { Component } from 'react';
//import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var diceTypes = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

class Dice extends Component {

  render() {
    return (
      <div>
      {diceTypes.map((diceColor) =>
        <div className='dice-box' style={{marginLeft:6}}>
          <div style={{float: 'left', marginLeft: 2, padding: 0}}>
            <button className='btnAdd'>⬆</button>
            <button className='btnAdd'>⬇</button>
          </div>
          <div className='dice-amount' style={{float: 'left', marginLeft: 3}}>
            <span>3</span>
          </div>
          <div className='dice-container' style={{float: 'left', marginLeft: 3}}>
            <img
              className='dice'
              style={{float: 'left', marginLeft: 3, width: 60}}
              src={`/images/${diceColor}.png`}
              alt={`${diceColor}`} />
          </div>
        </div>
      )}

      </div>
    );
  }
}
  export default Dice;
