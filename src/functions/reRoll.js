import React from 'react';
import Popup from 'react-popup';
import ModifyDicePool from './modifyDicePool';
import SelectReRoll from './selectReRoll';
import Fortune from './fortune';
import * as firebase from 'firebase';
var rolldice = require("./Roll.js");
import '../popup.css';
const channel = window.location.pathname.slice(1).toLowerCase(),
      user = window.location.search.slice(1);

function reRoll(message) {
  let roll = {}
  Popup.create({
  title: 'ReRoll',
  content: 'What would like to do to with this dice pool?',
  className: 'ReRoll',
  buttons: {
      left: [{
          text: 'Roll Same Dice Pool',
          className: 'ReRoll',
          action: () => {
            roll = sameDice(message)
            firebase.database().ref().child(`${channel}`).child('message').push().set(roll);

            Popup.close();
          }
        }, {
          text: 'Modify Dice Pool',
          className: 'ReRoll',
          action: () => {
            modifiyDice(message);
            Popup.close();
          }
        }, {
            text: 'Reroll Select Dice',
            className: 'ReRoll',
            action: () => {
              selectDice(message);
              Popup.close();
            }
        }, {
            text: 'Unmatched Fortune',
            className: 'ReRoll',
            action: () => {
              fortune(message);
              Popup.close();
            }
        }
        ]
  }});
}

function rebuiltdiceRoll(message) {
  let rebuilt = {diceRoll:{}, polyhedral:100, caption:''};
  if (message.polyhedral !== undefined) rebuilt.polyhedral = message.polyhedral[0][0];
  if (message.caption !== undefined) rebuilt.caption = message.caption;
  delete message.caption;
  delete message.text;
  delete message.rolledSymbols;
  Object.keys(message.roll).forEach((color)=>{
    rebuilt.diceRoll[color] = message.roll[color].length;
  });
  return rebuilt;
}

function sameDice(message) {
  let rebuilt = rebuiltdiceRoll(message);
  return rolldice.roll(rebuilt.diceRoll, rebuilt.polyhedral, rebuilt.caption, user);
}

function modifiyDice(message) {
  let rebuilt = rebuiltdiceRoll(message);
  Popup.create({
      title: 'Modify Dice Pool',
      className: 'reroll',
      content: <ModifyDicePool diceResult={message} rebuilt={rebuilt} popupClose={Popup.close}/>,
  });
}

function selectDice(message) {
  let rebuilt = rebuiltdiceRoll(message);
  Popup.create({
      title: 'Unmatched Calibration',
      className: 'rerollselect',
      content: <SelectReRoll diceResult={message} rebuilt={rebuilt} popupClose={Popup.close}/>,
  });
}

function fortune(message) {
  let rebuilt = rebuiltdiceRoll(message);
  Popup.create({
      title: 'Unmatched Fortune',
      className: 'rerollselect',
      content: <Fortune diceResult={message} rebuilt={rebuilt} popupClose={Popup.close}/>,
  });
}

module.exports = {
  reRoll: reRoll,
}
