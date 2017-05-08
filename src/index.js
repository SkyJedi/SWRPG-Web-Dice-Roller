import React from 'react';
import ReactDOM from 'react-dom';
import Destiny from './Destiny';
import Channel from './Channel';
import './index.css';
import * as firebase from 'firebase';
import config from './config'

firebase.initializeApp(config.config);
console.log(window.location.pathname);

if (window.location.pathname !== '/') {
  console.log('channel name detected');
  var channel = window.location.pathname.slice(1).toLowerCase();
}

console.log(channel);
if (channel !== undefined) {
  startUp();
} else {
  setChanPage();
}

function setChanName(chanName) {
  window.location = `/${chanName}`;
};

function setChanPage () {
  console.log();
  ReactDOM.render(
    <Channel setFormChan={setChanName} />,
    document.getElementById('root')
  );
};

function startUp () {
  ReactDOM.render(
    <Destiny />,
    document.getElementById('root')
  );
};
