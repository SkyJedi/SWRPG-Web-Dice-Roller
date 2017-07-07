import Popup from 'react-popup';
import * as firebase from 'firebase';
var rolldice = require("./Roll.js");
const channel = window.location.pathname.slice(1).toLowerCase(),
      user = window.location.search.slice(1);

function reRoll(message) {
  Popup.create({
  title: 'ReRoll',
  content: 'What would like to do to with this roll',
  className: 'ReRoll',
  buttons: {
      left: [{
          text: 'Roll Same Pool',
          className: 'ReRoll',
          action: () => {
            sameDice(message)
            Popup.close();
          }
        }, {
          text: 'Add Dice',
          className: 'ReRoll',
          action: () => {
            Popup.close();
          }
        }, {
            text: 'Remove Dice',
            className: 'ReRoll',
            action: () => {
              Popup.close();
            }
        }],
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
      }]
  }});
}

function sameDice(message) {
  delete message.text;
  let diceRoll = {};
  Object.keys(message).forEach((color)=>{
    diceRoll[color] = message[color].length;
  });
  let polyhedral = 0, caption = '';
  if (message.polyhedral !== undefined) polyhedral = message.polyhedral[0][0];
  if (message.caption !== undefined) polyhedral = message.caption;
  let roll = rolldice.roll(diceRoll, polyhedral, caption, user);
  console.log(roll); 
}
module.exports = {
  reRoll: reRoll,
}
