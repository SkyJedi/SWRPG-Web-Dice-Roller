import firebase from "firebase/app";
import "firebase/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Form, Image, Modal, Row, Table } from 'react-bootstrap';
import { ArrowsAngleContract, ArrowsAngleExpand, CaretLeft, CaretRight, DashLg, PlusLg, Square, XSquare } from 'react-bootstrap-icons';
import styles from "./Character.module.scss";
const dice = require("./functions/misc.js").dice;

var channel = window.location.pathname.slice(1).toLowerCase();

const Character = () => {
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');
  const [character, setCharacter] = React.useState({});
  const characterRef = firebase.database().ref().child(`${channel}`).child('character');
  const [currentCharacter, setCurrentCharacter] = React.useState({ name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png' });
  const [incapacitated, setIncapacitated] = React.useState(false);

  const [newWounds, setNewWounds] = React.useState('');
  const [newStrain, setNewStrain] = React.useState('');
  const [newCredits, setNewCredits] = React.useState('');

  const [expanded, setExpanded] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [characterEdit, setCharacterEdit] = React.useState(null);

  const [modifyModalTarget, setModifyModalTarget] = React.useState(null);

  useEffect(() => {
    characterRef.on('value', snap => {

      let newCharacter = currentCharacter;
      if (snap.val() !== null) {
        setCharacter(snap.val());

        if (currentCharacter.name === 'No Characters') {
          newCharacter = snap.val()[Object.keys(snap.val())[0]];
        } else {
          newCharacter = snap.val()[getcurrentKey()];
        }
      } else {
        setCharacter({});
      }
      checkIncap(newCharacter);
      setCurrentCharacter(newCharacter);
    });
  }, []);


  const createEmptyCharacter = () => {
    return {
      name: '',
      currentWounds: 0,
      maxWounds: '',
      currentStrain: 0,
      maxStrain: '',
      credits: '',
      imageURL: '/images/crest.png',
      key: genKey(),
      init: '',
      dice: { blue: '', black: '', upgrade: '', downgrade: '' },
    }
  };

  const remove = () => {
    if (currentCharacter.name === 'No Characters') return;
    if (Object.keys(character).length > 1) {
      previous();
      characterRef.child(getcurrentKey()).remove();
      messageRef.push().set({ text: currentCharacter['name'] + ' has been removed.' });
    } else {
      let newCharacter = { name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png' };
      setCurrentCharacter(newCharacter);
      checkIncap(newCharacter);
      characterRef.remove();
      messageRef.push().set({ text: currentCharacter['name'] + ' has been removed.' });
    }
  }

  const previous = () => {
    if (currentCharacter.name === 'No Characters') return;
    let position = getPosition();
    let characterCopy = Object.assign({}, character);
    if (position - 1 < 0) {
      position = Object.keys(characterCopy).length - 1;
    } else {
      position--;
    }
    let newCharacter = characterCopy[Object.keys(characterCopy)[position]];
    setCurrentCharacter(newCharacter);
    checkIncap(newCharacter);
  }

  const next = () => {
    if (currentCharacter.name === 'No Characters') return;
    let position = getPosition()
    if (position + 1 === Object.keys(character).length) {
      position = 0;
    } else {
      position++;
    }
    let newCharacter = character[Object.keys(character)[position]];
    setCurrentCharacter(newCharacter);
    checkIncap(newCharacter);
  }

  const modifyStats = (e) => {
    e.preventDefault();
    let currentCharacterCopy;
    if (characterEdit) {
      currentCharacterCopy = Object.assign({}, characterEdit);

      if (currentCharacterCopy.imageURL === '') {
        currentCharacterCopy.imageURL = '/images/crest.png';
      }
      if (currentCharacter.key === currentCharacterCopy.key) {
        messageRef.push().set({ text: currentCharacterCopy['name'] + ' has been successfully edited!' });
      } else {
        messageRef.push().set({ text: currentCharacterCopy['name'] + ' has been successfully added!' });
      }

      setCharacterEdit(null);
    } else {
      currentCharacterCopy = Object.assign({}, currentCharacter);
    }

    let modifyStat = {
      currentWounds: newWounds,
      currentStrain: newStrain,
      credits: newCredits
    };

    for (var j = 0; j < Object.keys(modifyStat).length; j++) {
      let stat = Object.keys(modifyStat)[j];
      let modifier = modifyStat[stat];
      if (modifier !== '') {
        let message = currentCharacterCopy['name'];
        if (modifier.includes('+')) {
          if (stat === 'credits') message += ' earns ';
          else message += ' takes ';
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +currentCharacterCopy[stat] + +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));
          //subtraction modifier
        } else if (modifier.includes('-')) {
          if (stat === 'credits') { message += ' spends ' }
          else { message += ' recovers ' }
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +currentCharacterCopy[stat] - +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));

        } else {
          modifier = +(modifier).replace(/\D/g, '');
          if (stat === 'credits') message += (' ' + stat + ' set from ' + (currentCharacterCopy[stat].length > 0 ? currentCharacterCopy[stat] : '0') + ' to ' + modifier);
          else message += (' ' + stat.slice(7).toLowerCase() + ' set from ' + (currentCharacterCopy[stat].length > 0 ? currentCharacterCopy[stat] : '0') + ' to ' + modifier);
        }
        if (modifier < 0) modifier = 0;
        currentCharacterCopy[stat] = modifier;
        messageRef.push().set({ text: message });

      }
    }

    setNewWounds('');
    setNewStrain('');
    setNewCredits('');
    characterRef.child(currentCharacterCopy.key).set(currentCharacterCopy);
    checkIncap(currentCharacterCopy);
    setCurrentCharacter(currentCharacterCopy);
  }

  const selectCharacter = (key) => {
    let currentCharacter = character[key];
    setCurrentCharacter(currentCharacter);
    checkIncap(currentCharacter);
  }

  const checkIncap = (currentCharacter) => {
    if (currentCharacter['currentWounds'] > currentCharacter['maxWounds'] || currentCharacter['currentStrain'] > currentCharacter['maxStrain']) {
      setIncapacitated(true);
    } else {
      setIncapacitated(false);
    }
  }

  const initClick = (key) => {
    let characterCopy = character[key];
    switch (characterCopy.init) {
      case 'X':
        characterCopy.init = '';
        break;
      case '':
        characterCopy.init = 'X'
        characterCopy.dice = { blue: '', black: '', upgrade: '', downgrade: '' };
        break;
      default:
        characterCopy.init = ''
    }
    characterRef.child(key).set(characterCopy);
  }

  const getcurrentKey = () => {
    let currentCharacterCopy = Object.assign({}, currentCharacter);
    let characterCopy = Object.assign({}, character);
    for (var i = 0; i < Object.keys(characterCopy).length; i++) {
      if (characterCopy[Object.keys(characterCopy)[i]]['key'] === currentCharacterCopy.key) {
        return Object.keys(characterCopy)[i];
      }
    }
  }

  const getPosition = () => {
    let currentCharacterCopy = Object.assign({}, currentCharacter);
    let characterCopy = Object.assign({}, character);
    if (Object.keys(currentCharacterCopy).length === 0) return 0;
    for (var i = 0; i < Object.keys(characterCopy).length; i++) {
      if (characterCopy[Object.keys(characterCopy)[i]]['key'] === currentCharacterCopy.key) {
        return i;
      }
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
      <Form onSubmit={modifyStats.bind(this)}>
        <Row>
          <Col sm="10"><strong>Characters</strong></Col>
          <Col sm='2' className="toggleCornerColumn">
            <Button className="toggleCornerButton" title='Click to Show/Hide Character Controls' variant={!expanded ? 'primary' : 'light'} onClick={(_) => setExpanded(!expanded)}>{!expanded ? <ArrowsAngleExpand></ArrowsAngleExpand> : <ArrowsAngleContract></ArrowsAngleContract>}</Button>
          </Col>
          <Col sm="2" className={styles.controlsColumn} hidden={!expanded}>
            <Row>
              <Col sm="6" className={styles.doubleButtonLeft}>
                <ButtonGroup vertical className={styles.buttonGroup}>
                  <Button disabled={characterEdit} className="icon-button-grouped" size='sm' variant="primary" title='Add Character' onClick={_ => setCharacterEdit(createEmptyCharacter())}><PlusLg></PlusLg></Button>
                  <Button disabled={characterEdit} className="icon-button-grouped" size='sm' variant="danger" title='Remove Character' onClick={setShowDeleteModal.bind(this, true)}><DashLg></DashLg></Button>
                </ButtonGroup>
              </Col>
              <Col sm="6" className={styles.doubleButtonRight}>
                <ButtonGroup vertical className={styles.buttonGroup}>
                  <Button disabled={characterEdit} className="icon-button-grouped" size='sm' variant="primary" title='Next Character' onClick={next.bind(this)}><CaretRight></CaretRight></Button>
                  <Button disabled={characterEdit} className="icon-button-grouped" size='sm' variant="secondary" title='Previous Character' onClick={previous.bind(this)}><CaretLeft></CaretLeft></Button>
                </ButtonGroup>
              </Col>
              <Col sm="12" className={styles.singleButtons}>
                <div className={styles.pixelFix}>
                  <Button hidden={characterEdit} className={styles.singleButton} variant="secondary" title='Edit Character' onClick={_ => setCharacterEdit(currentCharacter)}>Edit</Button>
                  <Button hidden={!characterEdit} className={styles.singleButton} variant="secondary" title='Abort Editing' onClick={_ => setCharacterEdit(null)}>Abort</Button>
                  <Button className={styles.singleButton} variant="primary" type='submit' title='Save'>Save</Button>
                </div>
              </Col>
            </Row>
          </Col>
          <Col sm={expanded ? '6' : '8'}>
            <Row>
              <Col sm='12'>
                <h3 hidden={characterEdit}>{currentCharacter['name']}</h3>
                <Form.Control className={styles.nameBox} size='lg' hidden={!characterEdit} value={characterEdit?.name ?? ''} onChange={e => setCharacterEdit(char => { return { ...char, name: e.target.value } })} placeholder='Character Name'></Form.Control>
                <h4 className={styles.incapacitated} hidden={!incapacitated || characterEdit}><strong>Incapacitated</strong></h4>
              </Col>
              <Row className={styles.valuePairWrapper}>
                <Col sm={expanded ? '4' : '3'} className={styles.currentValueWrapper}>
                  <Form.Control className={styles.currentValueBox} size='lg' value={newWounds} onChange={e => setNewWounds(e.target.value)} placeholder={characterEdit ? characterEdit.currentWounds : currentCharacter['currentWounds']}></Form.Control>
                </Col>
                <Col sm={expanded ? '8' : '9'} className={styles.maxValueWrapper}>
                  <strong className={styles.maxValueLabel}>/<span className={styles.maxValueLabel} hidden={characterEdit}>{currentCharacter['maxWounds']}</span></strong>
                  <Form.Control hidden={!characterEdit} className={styles.maxValueBox} size='lg' value={characterEdit?.maxWounds ?? ''} onChange={e => setCharacterEdit(char => { return { ...char, maxWounds: e.target.value } })} placeholder='Max'></Form.Control>
                  <strong className={styles.maxValueLabel}>&nbsp;Wounds</strong>
                </Col>
              </Row>
              <Row className={styles.valuePairWrapper}>
                <Col sm={expanded ? '4' : '3'} className={styles.currentValueWrapper}>
                  <Form.Control className={styles.currentValueBox} size='lg' value={newStrain} onChange={e => setNewStrain(e.target.value)} placeholder={characterEdit ? characterEdit.currentStrain : currentCharacter['currentStrain']}></Form.Control>
                </Col>
                <Col sm={expanded ? '8' : '9'} className={styles.maxValueWrapper}>
                  <strong className={styles.maxValueLabel}>/<span className={styles.maxValueLabel} hidden={characterEdit}>{currentCharacter['maxStrain']}</span></strong>
                  <Form.Control hidden={!characterEdit} className={styles.maxValueBox} size='lg' value={characterEdit?.maxStrain ?? ''} onChange={e => setCharacterEdit(char => { return { ...char, maxStrain: e.target.value } })} placeholder='Max'></Form.Control>
                  <strong className={styles.maxValueLabel}>&nbsp;Strain</strong>
                </Col>
              </Row>
              <Row className={styles.valuePairWrapper}>
                <Col sm={expanded ? '4' : '3'} className={styles.currentValueWrapper}>
                  <Form.Control className={styles.currentValueBox} size='lg' value={newCredits} onChange={e => setNewCredits(e.target.value)} placeholder={characterEdit ? characterEdit.credits : currentCharacter['credits']}></Form.Control>
                </Col>
                <Col sm={expanded ? '8' : '9'} className={styles.maxValueWrapper}>
                  <strong className={styles.maxValueLabel}> Credits</strong>
                </Col>
              </Row>
            </Row>
          </Col>
          <Col sm='4' className={styles.characterImageWrapper}>
            <Image className={styles.characterImage} src={characterEdit ? characterEdit.imageURL : currentCharacter['imageURL']} alt='Character Image'></Image>
          </Col>
        </Row>
        <Row hidden={!characterEdit} className={styles.valuePairWrapper}>
          <Col sm='12' className={styles.maxValueLabel}>
            Image URL:
          </Col>
          <Col sm='12'>
            <Form.Control value={characterEdit?.imageURL ?? ''} onChange={e => setCharacterEdit(char => { return { ...char, imageURL: e.target.value } })} placeholder='https://...'></Form.Control>
          </Col>
        </Row>
      </Form>

      <Modal show={showDeleteModal} onHide={(_) => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure, this will delete <strong>{currentCharacter['name']}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(_) => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={(_) => {
            remove();
            setShowDeleteModal(false);
          }
          }>
            DELETE
          </Button>
        </Modal.Footer>
      </Modal>

      <Table striped bordered hover hidden={characterEdit} className={styles.table}>
        <thead>
          <tr>
            <td><b>Init</b></td>
            <td><b>Name</b></td>
            <td><b>Wound</b></td>
            <td><b>Strain</b></td>
            <td><b>Dice</b></td>
          </tr>
        </thead>
        <tbody>
          {Object.keys(character).map((k) =>
            <tr className={currentCharacter.key === character[k].key ? styles.selectedRow : styles.unselectedRow} key={k}>
              <td role='button' onClick={initClick.bind(this, k)}>{character[k].init ? <XSquare></XSquare> : <Square></Square>}</td>
              <td role='button' onClick={selectCharacter.bind(this, k)}><b>{character[k].name}</b></td>
              <td role='button' onClick={selectCharacter.bind(this, k)}>&nbsp;{character[k].currentWounds}/{character[k].maxWounds}</td>
              <td role='button' onClick={selectCharacter.bind(this, k)}>&nbsp;{character[k].currentStrain}/{character[k].maxStrain}</td>
              <td role='button' onClick={_ => setModifyModalTarget(character[k])}>
                <Button size='sm' className={styles.cellButton} variant='primary' hidden={character[k].dice?.blue || character[k].dice?.black || character[k].dice?.upgrade || character[k].dice?.downgrade}><PlusLg></PlusLg></Button>
                <div className={styles.cellDie} dangerouslySetInnerHTML={{ __html: character[k].dice?.blue }} />
                <div className={styles.cellDie} dangerouslySetInnerHTML={{ __html: character[k].dice?.black }} />
                <div className={styles.cellDie} dangerouslySetInnerHTML={{ __html: character[k].dice?.upgrade }} />
                <div className={styles.cellDie} dangerouslySetInnerHTML={{ __html: character[k].dice?.downgrade }} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal show={modifyModalTarget != null} onHide={(_) => setModifyModalTarget(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Bonus Dice</Modal.Title>
        </Modal.Header>
        <Modal.Body>Which die would you like to give {modifyModalTarget?.name ?? ''}?</Modal.Body>
        <Modal.Footer className={styles.modalButtonContainer}>
          <Container>
            <Row>
              <Col sm="6" className={styles.modalButtonWrapper}>
                <Button className={styles.modalButton} variant="light" onClick={(_) => {
                  modifyModalTarget.dice.blue += "<img src='/images/blue.png' alt='blue.png' style='height: 1em' width: 1em;'/>";
                  characterRef.child(modifyModalTarget.key).set(modifyModalTarget);
                  setModifyModalTarget(null);
                }}>
                  <img src={`/images/blue.png`} alt="Blue die" className={`${styles.tinydie} me-1`} />
                  Bonus
                </Button>
              </Col>
              <Col sm="6" className={styles.modalButtonWrapper}>
                <Button className={styles.modalButton} variant="light" onClick={(_) => {
                  modifyModalTarget.dice.black += "<img src='/images/black.png' alt='black.png' style='height: 1em; width: 1em;'/>";
                  characterRef.child(modifyModalTarget.key).set(modifyModalTarget);
                  setModifyModalTarget(null);
                }}>
                  <img src={`/images/black.png`} alt="Black die" className={`${styles.tinydie} me-1`} />
                  Setback
                </Button>
              </Col>
              <Col sm="6" className={styles.modalButtonWrapper}>
                <Button className={styles.modalButton} variant="light" onClick={(_) => {
                  modifyModalTarget.dice.upgrade += "<img src='/images/upgrade.png' alt='upgrade.png' style='height: 15px' width: 15px;'/>";
                  characterRef.child(modifyModalTarget.key).set(modifyModalTarget);
                  setModifyModalTarget(null);
                }}>
                  <img src={`/images/upgrade.png`} alt="Upgrade die" className={styles.tinydie} />
                  Upgrade
                </Button>
              </Col>
              <Col sm="6" className={styles.modalButtonWrapper}>
                <Button className={styles.modalButton} variant="light" onClick={(_) => {
                  modifyModalTarget.dice.downgrade += "<img src='/images/downgrade.png' alt='downgrade.png' style='height: 15px' width: 15px;'/>";
                  characterRef.child(modifyModalTarget.key).set(modifyModalTarget);
                  setModifyModalTarget(null);
                }}>
                  <img src={`/images/downgrade.png`} alt="Downgrade die" className={`${styles.tinydie} me-1`} />
                  Downgrade
                </Button>
              </Col>
            </Row>
          </Container>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
export default Character;
