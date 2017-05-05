import React, { Component } from 'react';
import * as firebase from 'firebase';
import './App.css';


class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child('destiny')
    };
  }

  componentDidMount() {
    this.state.destinyRef.on('value', snap => {
      this.setState({
        destinyPoint: snap.val()
      });
    });
  }


  destinyAdd () {
    var newDestinyPointRef = this.state.destinyRef.push();
    newDestinyPointRef.set('white');
    console.log('adding a Destiny Point');
    console.log(this.state.destinyPoint);

  }
  destinyRemove () {
    if (this.state.destinyPoint != null) {
      console.log('removing a Destiny Point');
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
    }
    console.log(this.state.destinyPoint);
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
