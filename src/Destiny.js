import React, { Component } from 'react';
import * as firebase from 'firebase';
import './Destiny.css';


class Destiny extends Component {


  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child('destiny'),
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

  destinyAdd () {
    var newDestinyPointRef = this.state.destinyRef.push();
    newDestinyPointRef.set('lightside');
  }
  destinyRemove () {
    if (this.state.destinyPoint !== 0) {
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
    }
  }
  flip (v, k) {
    if (v === 'lightside') {
      this.state.destinyRef.child(k).set('darkside');
    } else {
      this.state.destinyRef.child(k).set('lightside');
    }
  }

  render() {
    return (
      <div className='App'>
        <div className="destiny-box">
          <div style={{float: 'left', marginLeft: 6}}>
            <button className="btnAdd" onClick={this.destinyAdd.bind(this)}>⬆</button>
            <button className="btnAdd" onClick={this.destinyRemove.bind(this)}>⬇</button>
          </div>
          <div style={{marginLeft: 40}}>
            {Object.entries(this.state.destinyPoint).map(([k,v])=>
              <span
              key={k}
              onClick={this.flip.bind(this, v, k)}>
              <img
                src={`/images/${v}.png`}
                alt={v} />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Destiny;
