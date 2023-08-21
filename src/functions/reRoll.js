import firebase from "firebase/compat/app";
import "firebase/compat/database";
import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import Dice from '../Dice';
import Fortune from './fortune';
import styles from './reRoll.module.scss';
import SelectReRoll from './selectReRoll';

var rolldice = require("./Roll.js");

const channel = window.location.pathname.slice(1).toLowerCase(),
  user = window.location.search.slice(1);

const ReRoll = (params) => {
  params.callin(message => setReRollMessage(message));

  const [reRollMessage, setReRollMessage] = React.useState(null);

  const [modifyRollResult, setModifyRollResult] = React.useState(null);
  const [selectDiceResult, setSelectDiceResut] = React.useState(null);
  const [flipDiceResult, setFlipDiceResut] = React.useState(null);

  const rebuiltdiceRoll = (message) => {
    let rebuilt = { diceRoll: {}, polyhedral: 100, caption: '' };
    if (message.polyhedral !== undefined) rebuilt.polyhedral = message.polyhedral[0][0];
    if (message.caption !== undefined) rebuilt.caption = message.caption;
    delete message.caption;
    delete message.text;
    delete message.rolledSymbols;
    Object.keys(message.roll).forEach((color) => {
      rebuilt.diceRoll[color] = message.roll[color].length;
    });
    return rebuilt;
  }

  const sameDice = (message) => {
    let rebuilt = rebuiltdiceRoll(message);
    return rolldice.roll(rebuilt.diceRoll, rebuilt.polyhedral, rebuilt.caption, user);
  }

  return (
    <Container>
      <Modal show={reRollMessage != null} onHide={_ => setReRollMessage(null)}>
        <Modal.Header closeButton>
          <Modal.Title>ReRoll</Modal.Title>
        </Modal.Header>
        <Modal.Body>What would like to do to with this dice pool?</Modal.Body>
        <Modal.Footer className={styles.modalButtonContainer}>
          <Row>
            <Col sm="6" className={styles.modalButtonWrapper}>
              <Button className={styles.modalButton} variant="light" onClick={(_) => {
                const roll = sameDice(reRollMessage);
                firebase.database().ref().child(`${channel}`).child('message').push().set(roll);
                setReRollMessage(null);
              }}>
                Roll Same Dice Pool
              </Button>
            </Col>
            <Col sm="6" className={styles.modalButtonWrapper}>
              <Button className={styles.modalButton} variant="light" onClick={(_) => {
                setModifyRollResult(reRollMessage);
                setReRollMessage();
              }}>
                Modify Dice Pool
              </Button>
            </Col>
            <Col sm="6" className={styles.modalButtonWrapper}>
              <Button className={styles.modalButton} variant="light" onClick={(_) => {
                setSelectDiceResut(reRollMessage);
                setReRollMessage();
              }}>
                Reroll Select Dice
              </Button>
            </Col>
            <Col sm="6" className={styles.modalButtonWrapper}>
              <Button className={styles.modalButton} variant="light" onClick={(_) => {
                setFlipDiceResut(reRollMessage);
                setReRollMessage();
              }}>
                Unmatched Fortune
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>

      <Modal show={modifyRollResult != null} onHide={_ => setModifyRollResult(null)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Modify Dice Pool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dice simplified previousRoll={modifyRollResult} callback={_ => setModifyRollResult(null)}></Dice>
        </Modal.Body>
      </Modal>

      <Modal show={selectDiceResult != null} onHide={_ => setSelectDiceResut(null)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Unmatched Calibration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Select Dice to Reroll.
        </Modal.Body>
        <Modal.Footer>
          <SelectReRoll diceResult={selectDiceResult} callback={_ => setSelectDiceResut(null)} />
        </Modal.Footer>
      </Modal>

      <Modal show={flipDiceResult != null} onHide={_ => setFlipDiceResut(null)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Unmatched Fortune</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Select Faces You Would Like To Swap
        </Modal.Body>
        <Modal.Footer>
          <Fortune diceResult={flipDiceResult} callback={_ => setFlipDiceResut(null)} />
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ReRoll;

