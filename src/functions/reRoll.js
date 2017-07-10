import React from 'react';
import Popup from 'react-popup';
import DicePool from './modifyDicePool';
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
        }/*, {
            text: 'Remove Dice',
            className: 'ReRoll',
            action: () => {
              Popup.close();
            }
        }
        */]/*,
      right: [{
            text: 'ReRoll Select Dice',
            className: 'ReRoll',
            action: () => {
              Popup.close();
            }
        }, {
            text: 'Something',
            className: 'ReRoll',
            action: () => {
              Popup.close();
            }
        },  {
          text: 'Something else',
          className: 'ReRoll',
          action: () => {
            Popup.close();
          }
      }]*/
  }});
}

function rebuiltdiceRoll(message) {
  let rebuilt = {diceRoll:{}, polyhedral:100, caption:''};
  if (message.polyhedral !== undefined) rebuilt.polyhedral = message.polyhedral[0][0];
  if (message.caption !== undefined) rebuilt.caption = message.caption;
  delete message.caption;
  delete message.text;
  delete message.rolledSymbols;
  Object.keys(message).forEach((color)=>{
    rebuilt.diceRoll[color] = message[color].length;
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
      title: 'Modifiy Dice Pool',
      className: 'reroll',
      content: <DicePool rollResults={message} rebuilt={rebuilt} popupClose={Popup.close}/>,
  });
}

module.exports = {
  reRoll: reRoll,
}
