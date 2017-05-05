import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as firebase from 'firebase';
import config from './config'

firebase.initializeApp(config.config);
console.log(App);
startUp();
if (Object.keys(App) === []) {
  console.log('empty destiny');
}
function startUp () {

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

};
