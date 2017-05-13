import React from 'react';
import ReactDOM from 'react-dom';
import Destiny from './Destiny';
import Channel from './Channel';
import Message from './Message';
import Dice from './Dice';
import Chat from './Chat';
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

function setChanName(chanName, userName) {
  window.location = `/${chanName}?${userName}`;
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
  var webApp =
  <div style={{minWidth: '900px'}}>
    <button className='btnAdd' style={{float: 'right'}} onClick={signOut}>X</button>
    <Destiny />
    <Chat />
    <Dice />
    <Message />
  </div>;


  ReactDOM.render(
    webApp,
    document.getElementById('root')
  );
};
