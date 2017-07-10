import React, { Component } from 'react';
import * as firebase from 'firebase';
import '../index.css';
var rolldice = require("./Roll.js"),
    user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase(),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white', 'success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'];

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
    let rollResults = this.props.rollResults;
    let rebuilt = this.props.rebuilt;
    let displayFaces = [];
    let displayRepeat = {};
    this.refs.caption.value = rebuilt.caption;

    diceOrder.forEach((color)=>{
      if (rollResults[color] === undefined) return;
      for (var i=0; i<rollResults[color].length; i++){
        let key = color + ',' + i
        displayRepeat[key] = 'none'
        if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') displayFaces.push({color: color, position: i,  path: `/images/dice/${color}-${rollResults[color][i]}.png`, key: color + ',' + i});
        else displayFaces.push({color: color, position: i,  path: `/images/${color}.png`, key: color + ',' + i});
      }
    })
    this.setState({displayFaces});
    this.setState({displayRepeat});
  }

  roll() {
      let rollResults = this.props.rollResults;
      let reRoll = Object.assign({}, this.state.reRoll);
      Object.keys(reRoll).forEach((key)=>{
        let diceRoll = {};
        diceRoll[reRoll[key].color] = 1;
        rollResults[reRoll[key].color].splice(reRoll[key].position, 1, rolldice.rollDicePool(diceRoll)[reRoll[key].color][0]);
      })
      rollResults.text = `<span> ${user} rerolled selected dice </span>`;
      rollResults = rolldice.countSymbols(rollResults, user);
      if (this.refs.caption.value !== '') {
        rollResults.caption = this.refs.caption.value;
        rollResults.text += `<span> ${this.refs.caption.value} </span>`;
      }
      if (rollResults.text !== undefined) this.state.messageRef.push().set(rollResults);
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
