import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);


class Destiny extends Component {

  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child(`${channel}`).child('destiny'),
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.destinyRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        destinyPoint: snap.val()
        });
      } else {
        this.setState({
          destinyPoint: 0
          });
      }
    });
  }

  destinyAdd() {
    this.state.destinyRef.push().set('lightside');
    this.state.messageRef.push().set(`${user} added a light side point.`);
  }
  destinyRemove() {
    if (this.state.destinyPoint !== 0) {
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
      this.state.messageRef.push().set(`${user} removed a destiny point.`);
    }
  }
  flip (v, k) {
    if (v === 'lightside') {
      this.state.destinyRef.child(k).set('darkside');
      this.state.messageRef.push().set(`${user} used a light side point.`)
    } else {
      this.state.destinyRef.child(k).set('lightside');
      this.state.messageRef.push().set(`${user} used a dark side point.`)
    }
  }

  render() {
    return (
      <div className='App' style={{width: '525px'}}>
        <div className="destiny-box">
          <div style={{float: 'left', marginLeft: 6}}>
            <button className='btnAdd' onClick={this.destinyAdd.bind(this)}>+</button>
            <button className='btnAdd' onClick={this.destinyRemove.bind(this)}>-</button>
          </div>
          <div style={{marginLeft: '60px'}}>
            {Object.entries(this.state.destinyPoint).map(([k,v])=>
              <span key={k} onClick={this.flip.bind(this, v, k)}>
              <img className='tokens' style={{padding: '5px 0 0 1px'}}src={`/images/${v}.png`} alt={v} />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Destiny;
