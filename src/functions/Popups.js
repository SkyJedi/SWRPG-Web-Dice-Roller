import Popup from 'react-popup';
import React from 'react';
import * as firebase from 'firebase';

var channel = window.location.pathname.slice(1).toLowerCase();

var characterPop = Popup.register({
    title: 'New Character',
    content:
    <div style={{textAlign: 'center'}}>
      <input className='textinput' style={{textAlign: 'center'}} id='charName' placeholder='Character Name' />
      <input className='textinput' style={{textAlign: 'center'}} id='maxWounds' placeholder='Max Wounds' />
      <input className='textinput' style={{textAlign: 'center'}} id='maxStrain' placeholder='Max Strain' />
      <input className='textinput' style={{textAlign: 'center'}} id='credits' placeholder='Credits' />
      <input className='textinput' style={{textAlign: 'center'}} id='imageURL' placeholder='Image URL' />
    </div>,
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'Save',
            className: 'success',
            action: function () {
                var character = {
                              name: document.getElementById('charName').value,
                              currentWounds: 0,
                              maxWounds: document.getElementById('maxWounds').value,
                              currentStrain: 0,
                              maxStrain: document.getElementById('maxStrain').value,
                              credits: document.getElementById('credits').value,
                              imageURL: document.getElementById('imageURL').value,
                              incapacitated: '#ecf0f1',
                            };
                if (character['imageURL'] === '') {
                  character['imageURL'] = '/images/crest.png';
                }
                firebase.database().ref().child(`${channel}`).child('character').push().set(character);
                firebase.database().ref().child(`${channel}`).child('currentCharacter').set(character)
                Popup.alert(character['name'] + ' has been successfully added!');
                Popup.close();
            }
        }]

    }
});

var popupURLChange = Popup.register({
    title: `Change imageURL`,
    content:
    <div style={{textAlign: 'center'}}>
      <input className='textinput' style={{textAlign: 'center'}} id='imageURL' placeholder='imageURL' />
    </div>,
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'Save',
            className: 'success',
            action: function () {

                Popup.alert('imageURL has been successfully changed!');
                Popup.close();
            }
        }]

    }
});

exports.characterPop = characterPop;
exports.popupURLChange = popupURLChange;
