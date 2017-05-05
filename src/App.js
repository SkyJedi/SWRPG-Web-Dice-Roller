import React, { Component } from 'react';
import * as firebase from 'firebase';
import './App.css';


class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child('destiny'),
      imageMap: []
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
    console.log('adding a Destiny Point');
  }
  destinyRemove () {
    if (this.state.destinyPoint !== 0) {
      console.log('removing a Destiny Point');
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
    }
  }

  render() {
    console.log(this.state.destinyPoint);
    return (
      <div className='App'>
        <div className="destiny-container">
          <div style={{float: 'left', paddingLeft: 6}}>
            <button className="btnAdd" onClick={this.destinyAdd.bind(this)}>⬆</button>
            <button className="btnAdd" onClick={this.destinyRemove.bind(this)}>⬇</button>
          </div>

          <div className="tokens">
            {Object.values(this.state.destinyPoint).map(imageName=>
              <span>
              <img src={`/images/${imageName}.png`} />
              </span>
            )}
          </div>

        </div>
      </div>
    );
  }
}

export default App;
