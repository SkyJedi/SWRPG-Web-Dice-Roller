import React, { Component } from 'react';
import * as firebase from 'firebase';
import '../index.css';
const diceFaces = require('./diceFaces.js').dice;
var rolldice = require("./Roll.js"),
    user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase();

class fortune extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      displayFaces: {},
      swap: {},
    };
  }

  componentDidMount() {
    let diceResult = this.props.diceResult;
    let rebuilt = this.props.rebuilt;
    let displayFaces = {};
    this.refs.caption.value = rebuilt.caption;
    Object.keys(diceFaces).forEach((color)=>{
      if (diceResult.roll[color] !== undefined){
        for (var i=0; diceResult.roll[color].length>i; i++){
          displayFaces[color+i] = {};
          if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') {
            displayFaces[color+i].current = {color: color, position: i, path: `/images/dice/${color}-${diceFaces[color][diceResult.roll[color][i]].face}.png`, key: color + i + 'current'};
            displayFaces[color+i].fortune = {};
            diceFaces[color][diceResult.roll[color][i]].adjacentposition.forEach((fortuneRoll)=>{
              displayFaces[color+i].fortune[fortuneRoll] = {key: color + i + 'fortune' + fortuneRoll, color: color, position: i, roll: fortuneRoll, path:`/images/dice/${color}-${diceFaces[color][fortuneRoll].face}.png`, display: 'none'};
            })
          }
          else displayFaces[color+i] = {current:{color: color, position: i,  path: `/images/${color}.png`, key: color + i + 'current'}, fortune: {}};
        }
      }
    })
    this.setState({displayFaces});
  }

  swap() {
    let diceResult = this.props.diceResult;
    let swap = Object.assign({}, this.state.swap);
    Object.keys(swap).forEach((key)=>{
      diceResult.roll[swap[key].color].splice(swap[key].position, 1, swap[key].roll);
    });
    diceResult.text = `<span> ${user} swapped dice faces </span>`;
    diceResult = rolldice.countSymbols(diceResult, user);
    if (this.refs.caption.value !== '') {
      diceResult.caption = this.refs.caption.value;
      diceResult.text += `<span> ${this.refs.caption.value} </span>`;
    }
    if (diceResult.text !== undefined) this.state.messageRef.push().set(diceResult);
    this.props.popupClose();
  }

   selectDice(row, fortuneRoll) {
     let displayFaces = Object.assign({}, this.state.displayFaces);
     let swap = Object.assign({}, this.state.swap);
     Object.keys(displayFaces[row].fortune).forEach((roll)=>{
       displayFaces[row].fortune[roll].display = 'none';
     });
     displayFaces[row].fortune[fortuneRoll].display = 'block'
     swap[row] = {color: displayFaces[row].fortune[fortuneRoll].color, position: displayFaces[row].fortune[fortuneRoll].position, roll: displayFaces[row].fortune[fortuneRoll].roll}
     this.setState({displayFaces});
     this.setState({swap});
   }

  render() {
    return (
      <div>
        <h2>Select Faces You Would Like To Swap</h2>

          <div>
            {Object.keys(this.state.displayFaces).map((row)=> {
              return(
              <div key={row} style={{borderStyle: 'groove'}}>
                <div key={this.state.displayFaces[row].current.key} className='dice rerollselect' style={{backgroundImage: `url(${this.state.displayFaces[row].current.path})`, borderRightStyle: 'groove'}}></div>
                <div key={row+'faces'} style={{display: 'inline-block'}}>
                  {Object.keys(this.state.displayFaces[row].fortune).map((fortuneRoll)=> {
                    return(
                    <div key={this.state.displayFaces[row].fortune[fortuneRoll].key} className='dice rerollselect' style={{backgroundImage: `url(${this.state.displayFaces[row].fortune[fortuneRoll].path})`}} onClick={this.selectDice.bind(this, row, fortuneRoll)}>
                    <img className='dice repeatselect' src={'/images/repeat.png'} alt='' style={{display: this.state.displayFaces[row].fortune[fortuneRoll].display}} />
                    </div>
                  )})}
                </div>
              </div>
            )})}
          </div>
        <div style={{display: 'block', marginTop: '10px'}}>
          <input type='button' ref='swap' className='lrgButton' onClick={this.swap.bind(this)} value='Swap' />
          <input className='textinput' ref='caption' name='caption' placeholder='caption' style={{width: '150px', paddingLeft: '5px'}}/>
        </div>
      </div>

    );
  }
}
export default fortune;
