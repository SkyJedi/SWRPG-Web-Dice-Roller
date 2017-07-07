import Popup from 'react-popup';
import * as firebase from 'firebase';
var rolldice = require("./Roll.js");
const channel = window.location.pathname.slice(1).toLowerCase(),
      user = window.location.search.slice(1);
function reRoll(message) {
  let roll = {}
  Popup.create({
  title: 'ReRoll',
  content: 'What would like to do to with this roll',
  className: 'ReRoll',
  buttons: {
      left: [{
          text: 'Roll Same Pool',
          className: 'ReRoll',
          action: () => {
            roll = sameDice(message)
            firebase.database().ref().child(`${channel}`).child('message').push().set(roll);

            Popup.close();
          }
        }/*, {
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

function sameDice(message) {
  delete message.text;
  let diceRoll = {};
  Object.keys(message).forEach((color)=>{
    diceRoll[color] = message[color].length;
  });
  let polyhedral = 0, caption = '';
  if (message.polyhedral !== undefined) polyhedral = message.polyhedral[0][0];
  if (message.caption !== undefined) caption = message.caption;
  return rolldice.roll(diceRoll, polyhedral, caption, user);
}
module.exports = {
  reRoll: reRoll,
}
