import { child, getDatabase, onValue, push, ref, remove, set } from '@firebase/database';
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Modal, Row } from 'react-bootstrap';
import { ArrowsAngleContract, ArrowsAngleExpand, DashLg, PlusLg, XLg } from "react-bootstrap-icons";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import styles from "./Destiny.module.scss";

var channel = window.location.pathname.slice(1).toLowerCase(),
  user = window.location.search.slice(1);


const Destiny = () => {
  const [expanded, setExpanded] = React.useState(false);

  const [destinyPoint, setDestinyPoint] = React.useState({});
  const destinyRef = child(ref(getDatabase()), `${channel}/destiny`);
  const messageRef = child(ref(getDatabase()), `${channel}/message`);

  const [showModal, setShowModal] = React.useState(false);

  useEffect(() => {
    onValue(destinyRef, snap => {
      if (snap.val() != null) {
        setDestinyPoint(snap.val());
      } else {
        setDestinyPoint({});
      }
    });
  },
    // eslint-disable-next-line
    []);

  const destinyAdd = () => {
    push(destinyRef, 'lightside');
    push(messageRef, { text: `${user} added a light side point.` });
  }
  const destinyRemove = () => {
    if (destinyPoint !== 0) {
      remove(child(destinyRef, Object.keys(destinyPoint)[Object.keys(destinyPoint).length - 1]));
      push(messageRef, { text: `${user} removed a destiny point.` });
    }
  }
  const flip = (v, k) => {
    if (v === 'lightside') {
      set(child(destinyRef, k), 'darkside');
      push(messageRef, { text: `${user} used a light side point.` })
    } else {
      set(child(destinyRef, k), 'lightside');
      push(messageRef, { text: `${user} used a dark side point.` })
    }
  }

  return (
    <Container className="top-level-container">
      <Row>
        <Col className={styles.buttonColumn} hidden={!expanded} xs='2' sm='1'>
          <ButtonGroup vertical className={styles.buttonGroup}>
            <Button className='icon-button-grouped' size='sm' variant="primary" title='Add Destiny Point' onClick={destinyAdd.bind(this)}><PlusLg></PlusLg></Button>
            <Button className='icon-button-grouped' size='sm' variant="secondary" title='Remove Destiny Point' onClick={destinyRemove.bind(this)}><DashLg></DashLg></Button>
            <Button className='icon-button-grouped' size='sm' variant="danger" title='Reset Destiny' onClick={(_) => setShowModal(true)}><XLg></XLg></Button>
          </ButtonGroup>
          <Modal show={showModal} onHide={(_) => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reset Destiny</Modal.Title>
            </Modal.Header>
            <Modal.Body>Would you like to reset Destiny?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(_) => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={(_) => {
                remove(destinyRef);
                push(messageRef, { text: `${user} resets the destiny pool from ${Object.entries(destinyPoint).map(([_, v]) => `<img class=diceface src=/images/${v}.png />`).join('')}` });
                setShowModal(false);
              }
              }>
                RESET
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
        <Col xs={expanded ? '8' : '10'} sm={expanded ? '9' : '10'} lg={expanded ? '10' : '11'} className={styles.contentColumn}>
          <Row >
            <Col><strong>Destiny</strong></Col>
          </Row>
          <Row className={styles.tokenContainer}>
            <Col className={styles.transitionGroupWrapper} id='destinyTokens'>
              {Object.entries(destinyPoint).map(([k, v]) =>
                <TransitionGroup key={k} className={styles.transitionGroup}>
                  <CSSTransition
                    key={`${k}-${v}`}
                    timeout={400}
                    classNames={{
                      enter: styles.tokenoutEnter,
                      enterActive: styles.tokenoutEnterActive,
                      exit: styles.tokenoutExit,
                      exitActive: styles.tokenoutExitActive
                    }}>
                    <Button className={styles.tokenButton} variant='light' onClick={flip.bind(this, v, k)}>
                      <img className={styles.tokenImage} title='Click to flip Destiny Point' src={`/images/${v}token.png`} alt={v} />
                    </Button>
                  </CSSTransition>
                </TransitionGroup>
              )}
            </Col>
          </Row>
        </Col>
        <Col xs='2' lg='1' className="toggleCornerColumn">
          <Button className="toggleCornerButton" title='Click to Show/Hide Destiny Controls' variant={!expanded ? 'primary' : 'light'} onClick={(_) => setExpanded(!expanded)}>{!expanded ? <ArrowsAngleExpand></ArrowsAngleExpand> : <ArrowsAngleContract></ArrowsAngleContract>}</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Destiny;
