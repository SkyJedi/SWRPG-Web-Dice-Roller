import { child, getDatabase, onValue, ref, remove } from "@firebase/database";
import { useEffect, useState } from 'react';
import { Button, Col, Container, Image, Modal, Row } from 'react-bootstrap';
import { ArrowsAngleContract, ArrowsAngleExpand, XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from './Message.module.scss';
import { isNewSessionText } from './functions/misc';
import ReRoll from './functions/reRoll';

import { LegacyMessageTransformer } from "./model/LegacyMessageTransformer";
import { Message, SeparatorEntry, SymbolEntry, TextEntry } from "./model/Message";
import { MessageTransformer } from "./model/MessageTransformer";


var channel = window.location.pathname.slice(1).toLowerCase();

const MessageModule = () => {
  const messageTransformer = new LegacyMessageTransformer(new MessageTransformer());
  const [messages, setMessages] = useState({});
  const messageRef = child(ref(getDatabase()), `${channel}/message`);

  const [keyToDelete, setKeyToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const [expanded, setExpanded] = useState(true);

  let reRoll = _ => { };

  useEffect(() => {
    onValue(messageRef, snap => {
      const values: any = snap.val();
      if (values !== null) {
        setMessages(values);
      }
      else {
        setMessages({});
      }
    });
  },
    // eslint-disable-next-line
    []);

  const isRollMessage = (message) => {
    return message.roll !== undefined;
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
      // regular roll; success=at least one success
      if ((message.results.success ?? 0) - (message.results.failure ?? 0) > 0) {
        return styles.rollMessageSuccess;
      } else {
        return styles.rollMessageFail;
      }
    }

    if (message.roll.white) {
      // only force roll; success=at least one lightside
      if (message.results.lightside > 0) {
        return styles.rollMessageSuccess;
      } else {
        return styles.rollMessageFail;
      }
    }

    //all other rolls
    return styles.rollMessageSuccess;
  }

  const toReact = (key: string, message: Message, expanded: boolean) => {

    let result: JSX.Element[] = [];

    message.entries.forEach((entry, index) => {
      if (entry instanceof TextEntry) {
        result.push(<span key={key + index}>{(entry as TextEntry).text}</span>);
      }
      if (entry instanceof SeparatorEntry) {
        result.push(<hr key={key + index} />);
      }
      if (entry instanceof SymbolEntry) {
        const symbol = entry as SymbolEntry;
        result.push(<Image key={key + index + expanded} className={styles.diceface} src={`/images/${symbol.symbol}.png`} alt={Symbol[symbol.symbol]} />);
      }
    });

    return result;
  };

  return (
    <Container className="top-level-container">
      <Row>
        <Col xs="10" lg="11"> <strong>Messages </strong></Col>
        <Col className="toggleCornerColumn" xs='2' lg='1'>
          <Button className="toggleCornerButton" title='Click to Expand/Collapse Results' variant={!expanded ? 'primary' : 'light'} onClick={() => setExpanded(!expanded)}>{!expanded ? <ArrowsAngleExpand></ArrowsAngleExpand> : <ArrowsAngleContract></ArrowsAngleContract>}</Button>
        </Col>
      </Row>
      <Row className={styles.messageContainer}>
        <Flipper flipKey={Object.keys(messages).length} spring='gentle'>
          {Object.entries(messages).reverse().map(([k, message]: [string, any], index) =>
            <Flipped key={k} flipId={k} stagger>
              <div>
                <Container key={k}>
                  <Row id={index === 0 ? 'newestRoll' : k} className={determineMessageClassNames(message)}>
                    <Col onClick={doReRoll.bind(this, k)} className={isRollMessage(message) ? styles.pseudoButtonDark : styles.noPseudoButton} xs='10' lg='11'>
                      {toReact(k, messageTransformer.toMessage(message.text, message.roll, message.caption, message.results, undefined, expanded), expanded)}
                    </Col>
                    <Col className={styles.closeMessageColumn} xs='2' lg='1'>
                      <Button className={styles.closeMessageButton} title='Delete message' variant='danger' onClick={setKeyToDelete.bind(this, k)}> <XLg></XLg></Button>
                    </Col>
                  </Row>
                </Container>
              </div>
            </Flipped>
          )}
        </Flipper>

        <Modal show={keyToDelete} onHide={() => setKeyToDelete(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete MessageComponent </Modal.Title>
          </Modal.Header>
          <Modal.Body> Are you sure, this will delete this message </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={(_) => setKeyToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={(_) => {
              remove(child(messageRef, keyToDelete));
              setKeyToDelete(null);
            }
            }>
              DELETE
            </Button>
          </Modal.Footer>
        </Modal>

        <ReRoll callin={callin => reRoll = callin}> </ReRoll>

        <Col>
          <Button className={styles.deleteAllButton} variant="danger" onClick={(_) => {
            setShowDeleteAllModal(true);
          }}>
            <XLg></XLg> Clear All Messages
          </Button>

          <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Clear Messages </Modal.Title>
            </Modal.Header>
            <Modal.Body> Are you sure, this will clear all the messages </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(_) => setShowDeleteAllModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={(_) => {
                remove(messageRef);
                setShowDeleteAllModal(false);
              }}>
                DELETE ALL
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}
export default MessageModule;