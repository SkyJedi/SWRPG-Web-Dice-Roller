import firebase from "firebase/app";
import "firebase/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, FormControl, Row } from 'react-bootstrap';
import styles from './selectReRoll.module.scss';

const diceFaces = require('./diceFaces.js').dice;
var rolldice = require("./Roll.js"),
  user = window.location.search.slice(1),
  channel = window.location.pathname.slice(1).toLowerCase();

const selectReRoll = (props) => {
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');
  const [displayFaces, setDisplayFaces] = React.useState([]);
  const [displayRepeat, setDisplayRepeat] = React.useState({});
  const [reRoll, setReRoll] = React.useState({});

  const [caption, setCaption] = React.useState('');

  useEffect(() => {
    if (props.diceResult) {
      const diceResult = props.diceResult;

      let displayFaces = [];
      let displayRepeat = {};
      setCaption(diceResult.caption ?? '');

      Object.keys(diceFaces).forEach((color) => {
        if (diceResult.roll[color] !== undefined) {
          for (var i = 0; diceResult.roll[color].length > i; i++) {
            let key = color + ',' + i
            displayRepeat[key] = false;
            if (color === 'yellow' || color === 'green' || color === 'blue' || color === 'red' || color === 'purple' || color === 'black' || color === 'white') {
              displayFaces.push({ color: color, position: i, path: `/images/dice/${color}-${diceFaces[color][diceResult.roll[color][i]].face}.png`, key: color + ',' + i });
            }
            else displayFaces.push({ color: color, position: i, path: `/images/${color}.png`, key: color + ',' + i });
          }
        }
      })
      setDisplayFaces(displayFaces);
      setDisplayRepeat(displayRepeat);

    }
  }
    , []);


  const roll = () => {
    let diceResult = Object.assign({}, props.diceResult);
    let reRollCopy = Object.assign({}, reRoll);
    Object.keys(reRollCopy).forEach((key) => {
      diceResult.roll[reRollCopy[key].color].splice(reRollCopy[key].position, 1, rolldice.rollDice(reRollCopy[key].color));
    });
    diceResult.text = `<span> ${user} ${makeText(Object.keys(reRollCopy).length)}</span>`;
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

  const makeText = count => {
    switch (count) {
      case 0:
        return 'rolled ';
      case 1:
        return 'rerolled 1 selected die ';
      default:
        return `rerolled ${count} selected dice `
    }
  }

  const selectDice = (file) => {
    let displayRepeatCopy = Object.assign({}, displayRepeat);
    let reRollCopy = Object.assign({}, reRoll);
    if (displayRepeatCopy[file.key]) {
      displayRepeatCopy[file.key] = false;
      delete reRollCopy[file.key];
    }
    else {
      displayRepeatCopy[file.key] = true;
      reRollCopy[file.key] = file;
    }
    setDisplayRepeat(displayRepeatCopy);
    setReRoll(reRollCopy);
  }

  return (
    <Container>
      <Row>
        <Col xs='12' className={styles.innerColumn}>
          {displayFaces.map((file) =>
            <Button key={file.key} variant='light' onClick={selectDice.bind(this, file)}>
              <div className={styles.diceContainer}>
                <img className={styles.die} src={file.path}></img>
                <img className={styles.badge} src={'/images/repeat.png'} hidden={!displayRepeat[file.key]} />
              </div>
            </Button>
          )}
        </Col>
        <Col md='6' className={styles.innerColumn}>
          <ButtonGroup size='lg' className={styles.rollGroup}>
            <Button onClick={roll.bind(this)}>Roll</Button>
            <FormControl className={styles.captionBox} value={caption} onChange={event => setCaption(event.target.value)} placeholder='Caption'></FormControl>
          </ButtonGroup>
        </Col>
      </Row>
    </Container>
  );
}
export default selectReRoll;
