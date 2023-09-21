import { child, getDatabase, onValue, orderByChild, push, query, ref, remove, set, update } from '@firebase/database';
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Modal, Row } from 'react-bootstrap';
import { ArrowRepeat, ArrowsAngleContract, ArrowsAngleExpand, CaretLeft, CaretRight, DashLg, PlusLg, Trash, XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from "./Initiative.module.scss";
const dice = require("./functions/misc.js").dice;

var channel = window.location.pathname.slice(1).toLowerCase();

const Initiative = () => {
  const [expanded, setExpanded] = React.useState(false);
  const initiativeRef = child(ref(getDatabase()), `${channel}/Initiative/order`);
  const [initiative, setInitiative] = React.useState([]);
  const initiativePastRef = child(ref(getDatabase()), `${channel}/Initiative/past`);
  const [initiativePast, setInitiativePast] = React.useState([]);
  const [position, setPosition] = React.useState({ round: 1, turn: 1 });
  const positionRef = child(ref(getDatabase()), `${channel}/Initiative/position`);
  const [character, setCharacter] = React.useState({});
  const characterRef = child(ref(getDatabase()), `${channel}/character`);

  const [showResetModal, setShowResetModal] = React.useState(false);
  const [modifyModalTarget, setModifyModalTarget] = React.useState(null);

  useEffect(() => {
    onValue(query(initiativeRef, orderByChild('roll')), snap => {
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

    onValue(query(initiativePastRef, orderByChild('roll')), snap => {
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

    onValue(positionRef, snap => {
      if (snap.val() != null) {
        setPosition(snap.val());
      } else {
        setPosition({ round: 1, turn: 1 });
      }
    });

    onValue(characterRef, snap => {
      if (snap.val() !== null) {
        setCharacter(snap.val());
      } else {
        setCharacter({});
      }
    });

  },
    // eslint-disable-next-line
    []);

  const initiativeAdd = () => {
    let i = 0;
    let Initiative = Object.assign({}, initiative);

    if (Object.keys(Initiative).length > 0) {
      i = ((+Initiative[0].roll) - 10).toString()
    } else {
      i = 0;
    }
    push(initiativeRef, { type: 'pc', roll: i, bonusDie: { blue: 0, black: 0 } });
  }

  const initiativeRemove = () => {
    if (initiative.length !== 0) {
      remove(child(initiativeRef, initiative[initiative.length - 1].key));
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
    set(positionRef, currPos);
    set(initiativeRef, objectify(Initiative));
    set(initiativePastRef, objectify(InitiativePast));
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
    set(positionRef, currPos);
    set(initiativeRef, objectify(Initiative));
    set(initiativePastRef, objectify(InitiativePast));
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
        update(child(initiativeRef, slot.key), { 'type': 'npc' });
        update(child(initiativeRef, slot.key), { 'roll': (+slot.roll - 1).toString() });

      } else {
        update(child(initiativeRef, slot.key), { 'type': 'pc' });
        update(child(initiativeRef, slot.key), { 'roll': (+slot.roll + 1).toString() });

      }
    } else {
      if (slot.type === 'pc') {
        update(child(initiativePastRef, slot.key), { 'type': 'npc' });
        update(child(initiativeRef, slot.key), { 'roll': (+slot.roll - 1).toString() });

      } else {
        update(child(initiativePastRef, slot.key), { 'type': 'pc' });
        update(child(initiativeRef, slot.key), { 'roll': (+slot.roll + 1).toString() });

      }
    }
  }

  const removeInitiative = (slot, time) => {
    if (time === 'current') {
      remove(child(initiativeRef, slot.key));
    } else {
      remove(child(initiativePastRef, slot.key));
    }
  }

  const addBonusDice = (slot, time, color) => {
    let tempbonusDie = { blue: 0, black: 0, upgrade: 0, downgrade: 0 }

    for (var i = 0; i < slot.bonusDie.length; i++) {
      tempbonusDie[slot.bonusDie[i]]++;
    }
    if (time === 'current') {
      tempbonusDie[color]++;
      update(child(initiativeRef, slot.key), { 'bonusDie': tempbonusDie });

    }
    if (time === 'past') {
      tempbonusDie[color]++;
      update(child(initiativePastRef, slot.key), { 'bonusDie': tempbonusDie });

    }
  }

  const reset = () => {
    remove(child(ref(getDatabase()), `${channel}/Initiative`));
  }

  const clearMarks = () => {
    if (Object.keys(character).length !== 0) {
      let newCharacters = Object.assign({}, character);
      Object.keys(newCharacters).forEach((key) =>
        newCharacters[key].init = '',
      );
      set(characterRef, newCharacters);
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
                        removeInitiative(modifyModalTarget.slot, modifyModalTarget.time);
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
