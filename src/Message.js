import firebase from "firebase/app";
import "firebase/database";
import React, { useEffect } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from './Message.module.scss';
import './Message.scss';
import { isNewSessionText } from './functions/misc';
import ReRoll from './functions/reRoll';

var channel = window.location.pathname.slice(1).toLowerCase();

const Message = () => {
  const [messages, setMessages] = React.useState(0);
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');

  const [keyToDelete, setKeyToDelete] = React.useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = React.useState(false);

  let reRoll = { send: _ => { } };

  useEffect(() => {
    messageRef.on('value', snap => {
      if (snap.val() !== null) { setMessages(snap.val()); }
      else { setMessages(0); }
    });
  }, []);

  const isRollMessage = (message) => {
    return Object.keys(message).length > 1;
  }

  const doReRoll = (key) => {
    let message = Object.assign({}, messages[key]);

    if (isRollMessage(message)) { reRoll(message) };
  }

  const determineMessageClassNames = (message) => {
    if (!isRollMessage(message)) {
      if (isNewSessionText(message.text)) {
        return styles.newSessionMessage;
      }
      return styles.textMessage;
    }

    if (message.roll.yellow || message.roll.green || message.roll.blue
      || message.roll.red || message.roll.purple || message.roll.black) {
      // regular roll; success = at least one success
      if ((message.results.success ?? 0) - (message.results.failure ?? 0) > 0) {
        return styles.rollMessageSuccess;
      } else {
        return styles.rollMessageFail;
      }
    }

    if (message.roll.white) {
      // only force roll; success = at least one lightside
      if (message.results.lightside > 0) {
        return styles.rollMessageSuccess;
      } else {
        return styles.rollMessageFail;
      }
    }

    //all other rolls
    return styles.rollMessageSuccess;
  }

  return (
    <Container className="top-level-container">
      <Row>
        <Col sm="12"><strong>Messages</strong></Col>
      </Row>
      <Row className={styles.messageContainer}>
        <Flipper flipKey={Object.keys(messages).length} spring='gentle'>
          {Object.keys(messages).reverse().map((k, index) =>
            <Flipped key={k} flipId={k} stagger>
              <div>
                <Container key={k} >
                  <Row id={index === 0 ? 'newestRoll' : k} className={determineMessageClassNames(messages[k])}>
                    <Col className={isRollMessage(messages[k]) ? styles.pseudoButtonDark : styles.noPseudoButton} xs='10' lg='11'>
                      <div onClick={doReRoll.bind(this, k)} dangerouslySetInnerHTML={{ __html: messages[k].text }} />
                    </Col>
                    <Col className={styles.closeMessageColumn} xs='2' lg='1'>
                      <Button className={styles.closeMessageButton} title='Delete message' variant='danger' onClick={setKeyToDelete.bind(this, k)}><XLg></XLg></Button>
                    </Col>
                  </Row>
                </Container>
              </div>
            </Flipped>
          )}
        </Flipper>

        <Modal show={keyToDelete} onHide={(_) => setKeyToDelete(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Message</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure, this will delete this message</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={(_) => setKeyToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={(_) => {
              messageRef.child(keyToDelete).remove();
              setKeyToDelete(null);
            }
            }>
              DELETE
            </Button>
          </Modal.Footer>
        </Modal>

        <ReRoll callin={callin => reRoll = callin}></ReRoll>

        <Col>
          <Button className={styles.deleteAllButton} variant="danger" onClick={(_) => {
            setShowDeleteAllModal(true);
          }}>
            <XLg></XLg> Clear All Messages
          </Button>

          <Modal show={showDeleteAllModal} onHide={(_) => setShowDeleteAllModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Clear Messages</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure, this will clear all the messages</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(_) => setShowDeleteAllModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={(_) => {
                messageRef.remove();
                setShowDeleteAllModal(false);
              }
              }>
                DELETE ALL
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}
export default Message;