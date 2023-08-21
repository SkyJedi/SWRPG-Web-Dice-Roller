import firebase from "firebase/compat/app";
import "firebase/compat/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, FormControl, Row } from "react-bootstrap";
import { ChevronDoubleRight } from "react-bootstrap-icons";
import styles from './fortune.module.scss';

const diceFaces = require('./diceFaces.js').dice;
var rolldice = require("./Roll.js"),
  user = window.location.search.slice(1),
  channel = window.location.pathname.slice(1).toLowerCase();

const fortune = props => {
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');
  const [displayFaces, setDisplayFaces] = React.useState({});
  const [swap, setSwap] = React.useState({});

  const [caption, setCaption] = React.useState('');


  useEffect(() => {
    const diceResult = props.diceResult;

    let displayFaces = {};
    setCaption(diceResult.caption ?? '');
    Object.keys(diceFaces).forEach((color) => {
      if (diceResult.roll[color] !== undefined) {
        for (var i = 0; diceResult.roll[color].length > i; i++) {
          displayFaces[color + i] = {};
          if (color === 'yellow' || color === 'green' || color === 'blue' || color === 'red' || color === 'purple' || color === 'black' || color === 'white') {
            displayFaces[color + i].current = { color: color, position: i, path: `/images/dice/${color}-${diceFaces[color][diceResult.roll[color][i]].face}.png`, key: color + i + 'current' };
            displayFaces[color + i].fortune = {};
            diceFaces[color][diceResult.roll[color][i]].adjacentposition.forEach((fortuneRoll) => {
              displayFaces[color + i].fortune[fortuneRoll] = { key: color + i + 'fortune' + fortuneRoll, color: color, position: i, roll: fortuneRoll, path: `/images/dice/${color}-${diceFaces[color][fortuneRoll].face}.png`, display: false };
            })
          }
          else {
            displayFaces[color + i] = { current: { color: color, position: i, path: `/images/${color}.png`, key: color + i + 'current' }, fortune: {} };
          }
        }
      }
    })
    setDisplayFaces(displayFaces);

  }, []);


  const swapFace = () => {
    let diceResult = props.diceResult;
    let swapCopy = Object.assign({}, swap);
    Object.keys(swapCopy).forEach((key) => {
      diceResult.roll[swapCopy[key].color].splice(swapCopy[key].position, 1, swapCopy[key].roll);
    });
    const count = Object.keys(swapCopy).length;
    diceResult.text = `<span> ${user} swapped ${count} ${count === 1 ? 'die face' : 'dice faces'} </span>`;
    diceResult = rolldice.countSymbols(diceResult, user);
    if (caption !== '') {
      diceResult.caption = caption;
      diceResult.text += `<span> ${caption} </span>`;
    }
    if (diceResult.text !== undefined) {
      messageRef.push().set(diceResult);
    }
    if (props.callback) {
      props.callback();
    }
  }

  const selectDice = (row, fortuneRoll) => {
    let displayFacesCopy = Object.assign({}, displayFaces);
    let swapCopy = Object.assign({}, swap);
    Object.keys(displayFacesCopy[row].fortune).forEach((roll) => {
      displayFacesCopy[row].fortune[roll].display = false;
    });
    displayFacesCopy[row].fortune[fortuneRoll].display = true;
    swapCopy[row] = { color: displayFacesCopy[row].fortune[fortuneRoll].color, position: displayFacesCopy[row].fortune[fortuneRoll].position, roll: displayFacesCopy[row].fortune[fortuneRoll].roll }
    setDisplayFaces(displayFacesCopy);
    setSwap(swapCopy);
  }

  return (
    <Container>
      {Object.keys(displayFaces).map((row) =>
        <Row className={styles.flipRow} key={displayFaces[row].current.key}>
          <Col className={styles.faceWrapperLeft} xs='3' lg='2'>
            <img className={styles.originalFaceImage} src={displayFaces[row].current.path}></img>
          </Col>
          <Col className={styles.faceWrapperCenter} xs='1'>
            <ChevronDoubleRight fontSize="xx-large"></ChevronDoubleRight>
          </Col>
          <Col className={styles.faceWrapperRight} xs='8' lg='9'>
            {Object.keys(displayFaces[row].fortune).map((fortuneRoll) =>
              <Button key={displayFaces[row].fortune[fortuneRoll].key} variant='light' onClick={selectDice.bind(this, row, fortuneRoll)} className={styles.diceButton}>
                <img className={styles.die} src={displayFaces[row].fortune[fortuneRoll].path}></img>
                <img className={styles.badge} src={'/images/repeat.png'} hidden={!displayFaces[row].fortune[fortuneRoll].display} />
              </Button>
            )}
          </Col>
        </Row>
      )
      }
      <Row>
        <Col md='6' className={styles.innerColumn}>
          <ButtonGroup size='lg' className={styles.rollGroup}>
            <Button onClick={swapFace.bind(this)}>Swap</Button>
            <FormControl className={styles.captionBox} value={caption} onChange={event => setCaption(event.target.value)} placeholder='Caption'></FormControl>
          </ButtonGroup>
        </Col>
      </Row>
    </Container >
  );
}
export default fortune;
