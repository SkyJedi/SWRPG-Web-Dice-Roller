import React, { Component } from 'react';
import * as firebase from 'firebase';
import './App.css';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: [],
      database: firebase.database().ref()
    };
  }
  updateDB (infoUpdate) {
    this.state.database.child('destiny').set(infoUpdate);
  }

  destinyAdd () {
    console.log('adding a Destiny Point');
    this.state.destinyPoint.push('white');
    console.log(this.state.destinyPoint);
    this.updateDB(this.state.destinyPoint);
  }
  destinyRemove () {
    console.log('removing a Destiny Point');
    this.state.destinyPoint.pop();
    console.log(this.state.destinyPoint);
    this.updateDB(this.state.destinyPoint);
  }

  render() {
    return (
      <div className='App'>
        <div className="destiny-container">
          <div style={{float: 'left', paddingLeft: 6}}>
            <button className="btnAdd" onClick={this.destinyAdd.bind(this)}>⬆</button>
            <button className="btnAdd" onClick={this.destinyRemove.bind(this)}>⬇</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
