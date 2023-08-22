import { child, getDatabase, onValue, push, ref, remove } from "@firebase/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Form, FormControl, Modal, Row } from 'react-bootstrap';
import { XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from './Chat.module.scss';
import "./Chat.scss";
import { isNewSessionText } from './functions/misc';

var channel = window.location.pathname.slice(1).toLowerCase(),
  user = window.location.search.slice(1);

const Chat = () => {
  const [chat, setChat] = React.useState({});
  const chatRef = child(ref(getDatabase()), `${channel}/chat`);
  const [chatInput, setChatInput] = React.useState('');

  const [keyToDelete, setKeyToDelete] = React.useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = React.useState(false);

  useEffect(() => {
    onValue(chatRef, snap => {
      if (snap.val() != null) {
        setChat(snap.val())
      } else {
        setChat(0);
      }
    });
  }, []);

  const sendchat = (stop) => {
    stop.preventDefault();
    let chat = imgCheck(chatInput);
    chat = urlCheck(chat);
    chat = `<span>${user}: ` + chat + `</span>`
    push(chatRef, chat);
    setChatInput('');
  }

  const imgCheck = (chat) => {
    chat = chat.split(' ');
    for (var i = 0; i < chat.length; i++) {
      if (chat[i].startsWith('[') && chat[i].endsWith(']')) {
        chat[i] = chat[i].slice(1).slice(0, -1).toLowerCase();
        chat[i] = `<img class=tinydie src=/images/${chat[i]}.png /> `;
      }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  const urlCheck = (chat) => {
    chat = chat.split(' ');
    for (var i = 0; i < chat.length; i++) {
      if (chat[i].includes('http')) {
        chat[i] = `</span><a href="${chat[i]}" style="font-size: small">${chat[i]}</a><span>`;
      }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  return (
    <Container className="top-level-container">
      <Row>
        <Col sm="12"><strong>Chat</strong></Col>
      </Row>
      <Row>
        <Col className={styles.sendWrapper} xs='12'>
          <Form onSubmit={sendchat.bind(this)}>
            <ButtonGroup className={styles.buttonGroup}>
              <FormControl as='textarea' rows='2' className={styles.chatBox} value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder='Text'></FormControl>
              <Button type='submit' disabled={!chatInput}>Send</Button>
            </ButtonGroup>
          </Form>
        </Col>

        <Col className={styles.chatContainer} xs='12'>
          <Flipper flipKey={Object.entries(chat).length} spring='wobbly'>
            {Object.entries(chat).reverse().map(([k, v]) =>
              <Flipped key={k} flipId={k} stagger>
                <div>
                  <Row key={k} className={isNewSessionText(v) ? styles.chatMessageNewSession : styles.chatNormalMessage}>
                    <Col className={styles.chatText} xs='10' lg='11' dangerouslySetInnerHTML={{ __html: v }} />
                    <Col className={styles.deleteWrapper} xs='2' lg='1'>
                      <Button size='sm' className={styles.deleteButton} title='Delete chat message' variant='danger' onClick={_ => setKeyToDelete(k)}><XLg></XLg></Button>
                    </Col>
                  </Row>
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
                remove(child(chatRef, keyToDelete));
                setKeyToDelete(null);
              }
              }>
                DELETE
              </Button>
            </Modal.Footer>
          </Modal>

          <Button className={styles.deleteAllButton} variant="danger" onClick={(_) => {
            setShowDeleteAllModal(true);
          }}>
            <XLg></XLg> Clear Chat
          </Button>

          <Modal show={showDeleteAllModal} onHide={(_) => setShowDeleteAllModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Clear Chat</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure, this will clear all the chat</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(_) => setShowDeleteAllModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={(_) => {
                remove(chatRef);
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
export default Chat;
