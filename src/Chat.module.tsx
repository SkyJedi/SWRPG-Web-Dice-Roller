import { child, getDatabase, onValue, push, ref, remove } from "@firebase/database";
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Form, FormControl, Image, Modal, Row } from 'react-bootstrap';
import { XLg } from 'react-bootstrap-icons';
import { Flipped, Flipper } from "react-flip-toolkit";
import styles from './Chat.module.scss';
import "./Chat.scss";
import { isNewSessionText } from './functions/misc';
import { Chat, LinkEntry, SymbolEntry, TextEntry } from "./model/Chat";
import { LegacyChatTransformer } from "./model/LegacyChatTransformer";

var channel = window.location.pathname.slice(1).toLowerCase(),
  user = window.location.search.slice(1);

const ChatModule = () => {
  const chatTransformer = new LegacyChatTransformer();

  const [chat, setChat] = useState({});
  const chatRef = child(ref(getDatabase()), `${channel}/chat`);
  const [chatInput, setChatInput] = useState('');

  const [keyToDelete, setKeyToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    onValue(chatRef, snap => {
      if (snap.val() != null) {
        setChat(snap.val());
      } else {
        setChat(null);
      }
    });
  },
    // eslint-disable-next-line
    []);

  const sendchat = (stop) => {
    if (stop) {
      stop.preventDefault();
    }
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

  const toReact = (key: string, message: Chat) => {

    let result: JSX.Element[] = [];

    message.entries.forEach((entry, index) => {
      if (entry instanceof TextEntry) {
        result.push(<span key={key + index}>{(entry as TextEntry).text}</span>);
      }
      if (entry instanceof LinkEntry) {
        const link = entry as LinkEntry;
        result.push(<a key={key + index} href={link.url}>{link.text}</a>);
      }
      if (entry instanceof SymbolEntry) {
        const symbol = entry as SymbolEntry;
        result.push(<Image key={key + index} className={styles.diceface} src={`/images/${symbol.symbol}.png`} alt={Symbol[symbol.symbol]} />);
      }
    });

    return result;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.code === 'Enter' && chatInput.length > 0) {
      sendchat(null);
    }
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
              <FormControl as='textarea' rows={2} className={styles.chatBox} value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder='Text' onKeyDown={onKeyDown.bind(this)}></FormControl>
              <Button type='submit' disabled={!chatInput}>Send</Button>
            </ButtonGroup>
          </Form>
        </Col>

        <Col className={styles.chatContainer} xs='12'>
          <Flipper flipKey={Object.entries(chat).length} spring='wobbly'>
            {Object.entries(chat).reverse().map(([k, v]: [string, string]) =>
              <Flipped key={k} flipId={k} stagger>
                <div>
                  <Row key={k} className={isNewSessionText(v) ? styles.chatMessageNewSession : styles.chatNormalMessage}>
                    <Col className={styles.chatText} xs='10' lg='11'>
                      {toReact(k, chatTransformer.toChat(v))}
                    </Col>
                    <Col className={styles.deleteWrapper} xs='2' lg='1'>
                      <Button size='sm' className={styles.deleteButton} title='Delete chat message' variant='danger' onClick={_ => setKeyToDelete(k)}><XLg></XLg></Button>
                    </Col>
                  </Row>
                </div>
              </Flipped>
            )}
          </Flipper>
          <Modal show={keyToDelete} onHide={() => setKeyToDelete(null)}>
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

          <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)}>
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
export default ChatModule;
