import firebase from "firebase/compat/app";
import "firebase/compat/database";
import React from 'react';
import { Col, Container, Row, ThemeProvider } from 'react-bootstrap';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom/client';
import './App.scss';
import Channel from './Channel';
import Character from './Character';
import Chat from './Chat';
import Destiny from './Destiny';
import Dice from './Dice';
import Initiative from './Initiative.js';
import Message from './Message';
import TopBar from './TopBar';
import config from './config';
import styles from './index.module.scss';

const root = ReactDOM.createRoot(document.getElementById("root"));

firebase.initializeApp(config.config);

if (window.location.pathname !== '/') {
  var channel = window.location.pathname.slice(1).toLowerCase();
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


if (channel !== undefined) {
  startUp();
} else {
  setChanPage();
}

function setChannelUser(chanName, userName) {
  window.location = `/${chanName}?${userName}`;
}

function wrapPage(inner) {
  return <ThemeProvider breakpoints={['xl', 'lg', 'md', 'sm', 'xs']}
    minBreakpoint="xs" >
    <CookiesProvider>
      <Container className='p-0'>
        {inner}
      </Container>
    </CookiesProvider>
  </ThemeProvider>;
}

function setChanPage() {
  root.render(
    wrapPage(<Channel setChannelUser={setChannelUser} />)
  );
}

function startUp() {
  let webApp = wrapPage(
    <Row className={styles.mainRow}>
      <Col className={styles.mainColumn} xs={{ offset: 1, span: 10 }} sm={{ offset: 0, span: 12 }} md={6} lg={7}>
        <TopBar className={styles.topbarFirst} />
        <Destiny />
        <Initiative />
        <Dice />
        <Message />
      </Col>
      <Col className={styles.mainColumn} xs={{ offset: 1, span: 10 }} sm={{ offset: 0, span: 12 }} md={6} lg={5}>
        <TopBar className={styles.topbarSecond} />
        <Character />
        <Chat />
      </Col>
    </Row>
  );


  root.render(
    webApp
  );
};
