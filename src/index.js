import React from 'react';
import ReactDOM from 'react-dom';
import Destiny from './Destiny';
import './index.css';
import * as firebase from 'firebase';
import config from './config'

firebase.initializeApp(config.config);
console.log(Destiny);
startUp();

function startUp () {

ReactDOM.render(
  <Destiny />,
  document.getElementById('root')
);

};
