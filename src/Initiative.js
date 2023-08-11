import firebase from "firebase/app";
import "firebase/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Modal, Row } from 'react-bootstrap';
import { ArrowRepeat, ArrowsAngleContract, ArrowsAngleExpand, CaretLeft, CaretRight, DashLg, PlusLg, Trash, XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from "./Initiative.module.scss";
const dice = require("./functions/misc.js").dice;

var channel = window.location.pathname.slice(1).toLowerCase();

const Initiative = () => {
  const [expanded, setExpanded] = React.useState(false);
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');
  const initiativeRef = firebase.database().ref().child(`${channel}`).child('Initiative').child('order');
  const [initiative, setInitiative] = React.useState([]);
  const initiativePastRef = firebase.database().ref().child(`${channel}`).child('Initiative').child('past');
  const [initiativePast, setInitiativePast] = React.useState([]);
  const [position, setPosition] = React.useState({ round: 1, turn: 1 });
  const positionRef = firebase.database().ref().child(`${channel}`).child('Initiative').child('position');
  const [character, setCharacter] = React.useState({});
  const characterRef = firebase.database().ref().child(`${channel}`).child('character');

  const [showResetModal, setShowResetModal] = React.useState(false);
  const [modifyModalTarget, setModifyModalTarget] = React.useState(null);

  useEffect(() => {
    initiativeRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function (child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        if (temp.bonusDie != null) {
          for (var i = 0; i < Object.keys(temp.bonusDie).length; i++) {
            let colorDie = Object.keys(temp.bonusDie)[i];
            for (var j = 0; j < temp.bonusDie[colorDie]; j++) {
              tempBonus.push(`${colorDie}`);
            }
          }
        }
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        setInitiative(final);
      } else {
        setInitiative(0);
      }
    });

    initiativePastRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function (child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        for (var i = 0; i < Object.keys(temp.bonusDie).length; i++) {
          let colorDie = Object.keys(temp.bonusDie)[i];
          for (var j = 0; j < temp.bonusDie[colorDie]; j++) {
            tempBonus.push(`${colorDie}`);
          }
        }
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        setInitiativePast(final);
      } else {
        setInitiativePast(0);
      }
    });

    positionRef.on('value', snap => {
      if (snap.val() != null) {
        setPosition(snap.val());
      } else {
        setPosition({ round: 1, turn: 1 });
      }
    });

    characterRef.on('value', snap => {
      if (snap.val() !== null) {
        setCharacter(snap.val());
      } else {
        setCharacter({});
      }
    });

  }, []);

  const initiativeAdd = () => {
    let i = 0;
    let Initiative = Object.assign({}, initiative);

    if (Object.keys(Initiative).length > 0) {
      i = ((+Initiative[0].roll) - 10).toString()
    } else {
      i = 0;
    }
    initiativeRef.push().set({ type: 'pc', roll: i, bonusDie: { blue: 0, black: 0 } });
  }

  const initiativeRemove = () => {
    if (initiative.length !== 0) {
      initiativeRef.child((initiative[initiative.length - 1]).key).remove();
    }
  }

  const initiativePrevious = () => {
    let currPos = Object.assign({}, position);
    let Initiative = initiative;
    let InitiativePast = initiativePast;
    if (currPos.turn === 1 && currPos.round === 1) {
      return;
    }
    if (currPos.turn - 1 < 1) {
      currPos.turn = initiative.length + initiativePast.length;
      currPos.round--;

      /*
        Work-around: if there is only one entry in the initiative
        we will not be notified by firebase because technically it has not changed before and after.
        In all other cases things progress as expected.
      */
      if (initiative.length + initiativePast.length !== 1) {
        InitiativePast = Initiative;
        Initiative = [InitiativePast.pop()];
      }
    } else {
      currPos.turn--;
      Initiative.unshift(InitiativePast.pop());
    }
    positionRef.set(currPos);
    initiativeRef.set(objectify(Initiative));
    initiativePastRef.set(objectify(InitiativePast));
  }

  const initiativeNext = () => {
    if (initiative.length + initiativePast.length === 0) {
      return;
    }
    let currPos = Object.assign({}, position);
    let Initiative = initiative;
    let InitiativePast = initiativePast;
    Initiative[0].bonusDie = [];
    if (currPos.turn >= initiative.length + initiativePast.length) {
      currPos.turn = 1;
      currPos.round++;

      /*
        Work-around: if there is only one entry in the initiative
        we will not be notified by firebase because technically it has not changed before and after.
        In all other cases things progress as expected.
      */
      if (initiative.length + initiativePast.length !== 1) {
        InitiativePast.push(Initiative.shift());
        Initiative = InitiativePast;
        InitiativePast = 0;
      }
      clearMarks();
    } else {
      currPos.turn++;
      InitiativePast.push(Initiative.shift());
    }
    positionRef.set(currPos);
    initiativeRef.set(objectify(Initiative));
    initiativePastRef.set(objectify(InitiativePast));
  }

  const objectify = (array) => {
    if (array === 0) { return 0; }
    let object = {};
    array.forEach(function (originalSlot) {
      let slot = Object.assign({}, originalSlot);
      let key = slot.key;
      delete slot.key;
      let tempbonusDie = { blue: 0, black: 0, upgrade: 0, downgrade: 0 }
      for (var i = 0; i < slot.bonusDie.length; i++) {
        tempbonusDie[slot.bonusDie[i]]++;
      }
      slot.bonusDie = tempbonusDie;
      object[key] = slot;
    });
    return object;
  }

  const flip = (slot, time) => {
    if (time === 'current') {
      if (slot.type === 'pc') {
        initiativeRef.child(slot.key).update({ 'type': 'npc' });
        initiativeRef.child(slot.key).update({ 'roll': (+slot.roll - 1).toString() });

      } else {
        initiativeRef.child(slot.key).update({ 'type': 'pc' });
        initiativeRef.child(slot.key).update({ 'roll': (+slot.roll + 1).toString() });

      }
    } else {
      if (slot.type === 'pc') {
        initiativePastRef.child(slot.key).update({ 'type': 'npc' });
        initiativeRef.child(slot.key).update({ 'roll': (+slot.roll - 1).toString() });

      } else {
        initiativePastRef.child(slot.key).update({ 'type': 'pc' });
        initiativeRef.child(slot.key).update({ 'roll': (+slot.roll + 1).toString() });

      }
    }
  }

  const remove = (slot, time) => {
    if (time === 'current') {
      initiativeRef.child(slot.key).remove();
    } else {
      initiativePastRef.child(slot.key).remove();
    }
  }

  const addBonusDice = (slot, time, color) => {
    let tempbonusDie = { blue: 0, black: 0, upgrade: 0, downgrade: 0 }

    for (var i = 0; i < slot.bonusDie.length; i++) {
      tempbonusDie[slot.bonusDie[i]]++;
    }
    if (time === 'current') {
      tempbonusDie[color]++;
      initiativeRef.child(slot.key).update({ 'bonusDie': tempbonusDie });

    }
    if (time === 'past') {
      tempbonusDie[color]++;
      initiativePastRef.child(slot.key).update({ 'bonusDie': tempbonusDie });

    }
  }

  const reset = () => {
    firebase.database().ref().child(`${channel}`).child('Initiative').remove();
  }

  const clearMarks = () => {
    if (Object.keys(character).length !== 0) {
      let newCharacters = Object.assign({}, character);
      Object.keys(newCharacters).forEach((key) =>
        newCharacters[key].init = '',
      );
      characterRef.set(newCharacters);
    }
  }

  const genKey = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 15; i++)
      text += possible.charAt(dice(possible.length) - 1);
    return text;
  }

  return (
    <Container className="top-level-container">
      <Row>
        <Col xs="3" sm="2" hidden={!expanded}>
          <Row>
            <Col xs="6" className={styles.buttonColumn}>
              <ButtonGroup vertical className={styles.buttonGroup}>
                <Button className='icon-button-grouped' size='sm' variant="primary" title='Add Initiative Slot' onClick={initiativeAdd.bind(this)}><PlusLg></PlusLg></Button>
                <Button className='icon-button-grouped' size='sm' variant="danger" title='Remove Initiative Slot' onClick={initiativeRemove.bind(this)}><DashLg></DashLg></Button>
              </ButtonGroup>
            </Col>
            <Col xs="6" className={styles.buttonColumn}>
              <ButtonGroup vertical className={styles.buttonGroup}>
                <Button className='icon-button-grouped' size='sm' variant="primary" title='Next Initiative Slot' onClick={initiativeNext.bind(this)}><CaretRight></CaretRight></Button>
                <Button className='icon-button-grouped' size='sm' variant="secondary" title='Previous Initiative Slot' onClick={initiativePrevious.bind(this)}><CaretLeft></CaretLeft></Button>
              </ButtonGroup>
            </Col>
            <Col className={styles.doubleButtonColumn}>
              <div className={styles.doubleButtonPixelFix}>
                <Button className='icon-button-grouped' size='sm' variant="danger" title='Reset Initiative' onClick={(_) => setShowResetModal(true)}><XLg></XLg> Reset</Button>
              </div>
              <Modal show={showResetModal} onHide={(_) => setShowResetModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Reset Initiative</Modal.Title>
                </Modal.Header>
                <Modal.Body>Would you like to reset Initiative?</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={(_) => setShowResetModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={(_) => {
                    reset();
                    setShowResetModal(false);
                  }
                  }>
                    RESET
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Col>
        <Col xs={expanded ? '7' : '10'} sm={expanded ? '8' : '10'} lg={expanded ? '9' : '11'} className={styles.contentColumn}>
          <Row>
            <Col><strong>Initiative</strong> &nbsp; Round: {position.round} | Turn: {position.turn}</Col>
          </Row>
          <Row>
            <Col className={styles.tokenContainer}>
              <Flipper flipKey={`${initiative.length}-${initiativePast.length}`} spring='gentle'>
                {initiative.map((slot) =>
                  <Flipped key={slot.key} flipId={slot.key} >
                    <Button title='Click to Modify Initiative Slot' className={styles.initiativeButton} variant='light' key={slot.key} onClick={(_) => setModifyModalTarget({ slot: slot, time: 'current' })}>
                      <div className={styles.badgeContainer}>
                        {slot.bonusDie.reverse().map((type) =>
                          <img className={styles.badge} src={`/images/${type}.png`} alt={type} key={genKey()} />
                        )}
                      </div>
                      <img className={styles.token} src={`/images/${slot.type}.png`} alt={slot.type} />
                    </Button>
                  </Flipped>
                )}
                <Flipped key='divider' flipId='divider' >
                  <img className={styles.initiativeSlot} src={`/images/repeat.png`} hidden={initiative.length + initiativePast.length <= 0} alt='End of round' />
                </Flipped>
                {initiativePast.map((slot) =>
                  <Flipped key={slot.key} flipId={slot.key} stagger>
                    <Button title='Click to Modify Initiative Slot' className={styles.initiativeButton} variant='light' key={slot.key} onClick={(_) => setModifyModalTarget({ slot: slot, time: 'past' })}>
                      <div className={styles.badgeContainer}>
                        {slot.bonusDie.reverse().map((type) =>
                          <img className={styles.badge} src={`/images/${type}.png`} alt={type} key={genKey()} />
                        )}
                      </div>
                      <img className={styles.token} src={`/images/${slot.type}.png`} alt={slot.type} />
                    </Button>
                  </Flipped>
                )}
              </Flipper>

              <Modal show={modifyModalTarget != null} onHide={(_) => setModifyModalTarget(null)}>
                <Modal.Header closeButton>
                  <Modal.Title>Modify Initiative Slot</Modal.Title>
                </Modal.Header>
                <Modal.Body>What would like to do to this Initiative Slot?</Modal.Body>
                <Modal.Footer className={styles.modalButtonContainer}>
                  <Row>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="light" onClick={(_) => {
                        addBonusDice(modifyModalTarget.slot, modifyModalTarget.time, 'blue');
                        setModifyModalTarget(null);
                      }}>
                        <img src={`/images/blue.png`} alt="Blue die" className={styles.inlineTextImage} />
                        Bonus
                      </Button>
                    </Col>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="light" onClick={(_) => {
                        addBonusDice(modifyModalTarget.slot, modifyModalTarget.time, 'black');
                        setModifyModalTarget(null);
                      }}>
                        <img src={`/images/black.png`} alt="Black die" className={styles.inlineTextImage} />
                        Setback
                      </Button>
                    </Col>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="danger" onClick={(_) => {
                        remove(modifyModalTarget.slot, modifyModalTarget.time);
                        setModifyModalTarget(null);
                      }}>
                        <Trash className={styles.inlineTextImage}></Trash>
                        DELETE
                      </Button>
                    </Col>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="light" onClick={(_) => {
                        addBonusDice(modifyModalTarget.slot, modifyModalTarget.time, 'upgrade');
                        setModifyModalTarget(null);
                      }}>
                        <img src={`/images/upgrade.png`} alt="Upgrade die" className={styles.inlineTextImage} />
                        Upgrade
                      </Button>
                    </Col>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="light" onClick={(_) => {
                        addBonusDice(modifyModalTarget.slot, modifyModalTarget.time, 'downgrade');
                        setModifyModalTarget(null);
                      }}>
                        <img src={`/images/downgrade.png`} alt="Downgrade die" className={styles.inlineTextImage} />
                        Downgrade
                      </Button>
                    </Col>
                    <Col xs="4" className={styles.modalButtonWrapper}>
                      <Button className={styles.modalButton} variant="primary" onClick={(_) => {
                        flip(modifyModalTarget.slot, modifyModalTarget.time);
                        setModifyModalTarget(null);
                      }}>
                        <ArrowRepeat className={styles.inlineTextImage}></ArrowRepeat>
                        Flip
                      </Button>
                    </Col>
                  </Row>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Col>
        <Col xs='2' lg='1' className="toggleCornerColumn">
          <Button className="toggleCornerButton" title='Click to Show/Hide Initiative Controls' variant={!expanded ? 'primary' : 'light'} onClick={(_) => setExpanded(!expanded)}>{!expanded ? <ArrowsAngleExpand></ArrowsAngleExpand> : <ArrowsAngleContract></ArrowsAngleContract>}</Button>
        </Col>
      </Row>
    </Container>
  );

}
export default Initiative;
