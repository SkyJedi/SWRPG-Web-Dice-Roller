import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();

class Character extends Component {
  constructor() {
    super();
    this.state = {
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
    };
  }

  componentDidMount() {
    this.state.characterRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        character: snap.val()
        });
      } else {
        this.setState({
          message: 0
          });
      }
    });
  }

  render() {
    return (


      <div className='dice-box' style={{margin: '5px', marginTop: '40px', Width: '350px', minHeight: '250px', display: 'block', textAlign: 'center'}}>
        <img className='characterimage' style={{float: 'right', marginRight: '5px'}} src={`http://i.imgur.com/5SHPVO0.jpg`} alt=''/>

        <div style={{float: 'left'}}>
          <button className='btnAdd' style={{width: '50px'}}>New</button>
          <button className='btnAdd' style={{width: '50px'}}>←</button>
          <button className='btnAdd' style={{width: '50px'}}>→</button>
        </div>

          <b style={{fontSize: '25px', color: 'black', textAlign: 'center'}}>Vimec Daeta</b>
          <hr style={{height:'4pt', visibility:'hidden'}} />
          <b style={{fontSize: '25px', color: 'red'}}>Incapacitated</b>
          <hr style={{height:'2pt', visibility:'hidden'}} />

          <div style={{float: 'left', marginLeft: '90px', textAlign: 'left'}}>
            <div>
              <input className='textinput' ref='currentWounds' defaultValue='16' style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}>/ 15 Wounds</b>
            </div>
            <div>
              <input className='textinput' ref='currentStrain' defaultValue='2' style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}>/ 12 Strain</b>
            </div>
            <div>
              <input className='textinput' ref='credits' defaultValue='1200' style={{width: '50px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}> Credits</b>
            </div>
          </div>
      </div>

    )
  }
}
  export default Character;
