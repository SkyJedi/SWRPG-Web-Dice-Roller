import React from 'react';
import ReactDOM from 'react-dom';
import Destiny from './Destiny';
import Channel from './Channel';
import Message from './Message';
import './index.css';
import * as firebase from 'firebase';
import config from './config';
firebase.initializeApp(config.config);

if (window.location.pathname !== '/') {
  var channel = window.location.pathname.slice(1).toLowerCase();
}

if (channel !== undefined) {
  startUp();
} else {
  setChanPage();
}

function setChanName(chanName) {
  window.location = `/${chanName}`;
}

function signOut() {
  window.location = `/`;
}

function setChanPage () {
  ReactDOM.render(
    <Channel setFormChan={setChanName} />,
    document.getElementById('root')
  );
}

function startUp () {
  var user = firebase.auth().currentuser;
  var webApp =
  <div>
    <button className='btnAdd' style={{float: 'right'}} onClick={signOut}>X</button>
    <Destiny />
    <Message />
    <span>{user} </span>
  </div>;


  ReactDOM.render(
    webApp,
    document.getElementById('root')
  );
};
