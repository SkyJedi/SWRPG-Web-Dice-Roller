import React, { Component } from 'react';
import * as firebase from 'firebase';
import '../index.css';
const diceFaces = require('./diceFaces.js').dice;
var rolldice = require("./Roll.js"),
    user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase();

class selectReRoll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      displayFaces: [],
      displayRepeat: {},
      reRoll: {},
    };
  }

  componentDidMount() {
    let diceResult = this.props.rollResults;
    let rebuilt = this.props.rebuilt;
    let displayFaces = [];
    let displayRepeat = {};
    this.refs.caption.value = rebuilt.caption;

    Object.keys(diceFaces).forEach((color)=>{
      if (diceResult.roll[color] !== undefined){
        for (var i=0; diceResult.roll[color].length>i; i++){
          let key = color + ',' + i
          displayRepeat[key] = 'none'
          if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') {
            displayFaces.push({color: color, position: i,  path: `/images/dice/${color}-${diceFaces[color][diceResult.roll[color][i]].face}.png`, key: color + ',' + i});
          }
          else displayFaces.push({color: color, position: i,  path: `/images/${color}.png`, key: color + ',' + i});
        }
      }
    })
    this.setState({displayFaces});
    this.setState({displayRepeat});
  }

  roll() {
      let diceResult = this.props.rollResults;
      let reRoll = Object.assign({}, this.state.reRoll);
      Object.keys(reRoll).forEach((key)=>{
        diceResult.roll[reRoll[key].color].splice(reRoll[key].position, 1, rolldice.rollDice(reRoll[key].color));
      });
      diceResult.text = `<span> ${user} rerolled selected dice </span>`;
      diceResult = rolldice.countSymbols(diceResult, user);
      if (this.refs.caption.value !== '') {
        diceResult.caption = this.refs.caption.value;
        diceResult.text += `<span> ${this.refs.caption.value} </span>`;
      }
      if (diceResult.text !== undefined) this.state.messageRef.push().set(diceResult);
      this.props.popupClose();
     }


  selectDice(file) {
    let displayRepeat = Object.assign({}, this.state.displayRepeat);
    let reRoll = Object.assign({}, this.state.reRoll);
    if (displayRepeat[file.key] === 'block') {
      displayRepeat[file.key] = 'none';
      delete reRoll[file.key];
    }
    else {
      displayRepeat[file.key] = 'block';
      reRoll[file.key] = file;
    }
    this.setState({displayRepeat});
    this.setState({reRoll});
  }

  render() {
    return (
      <div>
        {this.state.displayFaces.map((file)=>
          <div key={file.key} className='dice rerollselect' style={{backgroundImage: `url(${file.path})`}} onClick={this.selectDice.bind(this, file)}><img className='dice repeatselect' src={'/images/repeat.png'} alt='' style={{display: this.state.displayRepeat[file.key]}} /></div>
        )}
        <div style={{display: 'block', marginTop: '10px'}}>
          <input type='button' ref='roll' className='lrgButton' onClick={this.roll.bind(this)} value='Roll' />
          <input className='textinput' ref='caption' name='caption' placeholder='caption' style={{width: '150px', paddingLeft: '5px'}}/>
        </div>
      </div>

    );
  }
}
export default selectReRoll;
