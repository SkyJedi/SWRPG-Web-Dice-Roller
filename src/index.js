import React from 'react';
import ReactDOM from 'react-dom';
import Popup from 'react-popup';
import Destiny from './Destiny';
import Channel from './Channel';
import Message from './Message';
import Dice from './Dice';
import Chat from './Chat';
import Character from './Character';
import TopBar from './TopBar';
import Initiative from './Initiative.js'
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

function setChanPage () {
  ReactDOM.render(
    <Channel setFormChan={setChanName} />,
    document.getElementById('root')
  );
}

function startUp () {
  var webApp =
  <div style={{minWidth:'950px'}}>
    <div className='left'>
      <Destiny />
      <Initiative />
      <Dice />
      <Message />
    </div>
    <div className='right'>
      <TopBar />
      <Character />
      <Chat />
    </div>
  </div>;


  ReactDOM.render(
    webApp,
    document.getElementById('root')
  );

  ReactDOM.render(
    <Popup />,
    document.getElementById('popupContainer')
  );
};
