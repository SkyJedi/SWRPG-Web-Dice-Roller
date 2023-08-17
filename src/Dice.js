import firebase from "firebase/app";
import "firebase/database";
import React, { useEffect } from 'react';
import { Button, ButtonGroup, Col, Container, Dropdown, DropdownButton, Form, FormCheck, FormControl, Row } from 'react-bootstrap';
import { ArrowDown, ArrowUp, ArrowsAngleContract, ArrowsAngleExpand, XLg } from 'react-bootstrap-icons';
import styles from './Dice.module.scss';
import { decreaseDice, increaseDice } from './functions/modifyDicePool.js';

var crit = require("./functions/Crit.js");
var rolldice = require("./functions/Roll.js");
const dice = require("./functions/misc.js").dice;
const diceFaces = require('./functions/diceFaces.js').dice;


var channel = window.location.pathname.slice(1).toLowerCase(),
  user = window.location.search.slice(1);
const defaultDiceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
const extendedDiceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white', 'lightside', 'darkside', 'success', 'advantage', 'triumph', 'failure', 'threat', 'despair'];

const Dice = (params) => {
  const [simplifiedLayout, setSimplifiedLayout] = React.useState(params.simplified ? true : false)
  const [diceRoll, setDiceRoll] = React.useState({ yellow: 0, green: 0, blue: 0, red: 0, purple: 0, black: 0, white: 0, polyhedral: 0, success: 0, advantage: 0, triumph: 0, failure: 0, threat: 0, despair: 0, lightside: 0, darkside: 0 });
  const messageRef = firebase.database().ref().child(`${channel}`).child('message');
  const destinyRef = firebase.database().ref().child(`${channel}`).child('destiny');
  const InitiativeRef = firebase.database().ref().child(`${channel}`).child('Initiative').child('order');
  const [caption, setCaption] = React.useState('');
  const [polyhedral, setPolyhedral] = React.useState(100);
  const [critModifier, setCritModifier] = React.useState('');
  const [saveCheck, setSaveCheck] = React.useState(false);
  const [diceOrder, setDiceOrder] = React.useState(params.simplified ? extendedDiceOrder : defaultDiceOrder);
  const [noDiceChosen, setNoDiceChosen] = React.useState(true);

  useEffect(() => {
    if (params.previousRoll) {
      let diceRollCopy = Object.assign({}, diceRoll);
      Object.keys(params.previousRoll.roll).forEach((color) => {
        diceRollCopy[color] = (params.previousRoll.roll[color] ?? []).length;
      })
      setDiceRoll(diceRollCopy);
      setCaption(params.previousRoll.caption ?? '');
      setPolyhedral((params.previousRoll.roll.polyhedral ?? [[100]])[0][0]);

    }
  }
    , []);

  const addDie = (diceColor) => {
    let newDiceRoll = Object.assign({}, diceRoll);
    newDiceRoll[diceColor] += 1;
    setDiceRoll(newDiceRoll);

    calculateNoDiceChosen(newDiceRoll);
  }

  const removeDie = (diceColor) => {
    if (diceRoll[diceColor] > 0) {
      let newDiceRoll = Object.assign({}, diceRoll);
      newDiceRoll[diceColor] -= 1;
      setDiceRoll(newDiceRoll);

      calculateNoDiceChosen(newDiceRoll);
    }
  }

  const calculateNoDiceChosen = (rolls) => {
    for (let key in rolls) {
      if (rolls[key] > 0) {
        setNoDiceChosen(false);
        return;
      }
    }

    setNoDiceChosen(true);
  }

  const reset = () => {
    let newDiceRoll = { yellow: 0, green: 0, blue: 0, red: 0, purple: 0, black: 0, white: 0, polyhedral: 0, success: 0, advantage: 0, triumph: 0, failure: 0, threat: 0, despair: 0, lightside: 0, darkside: 0 };
    setDiceRoll(newDiceRoll);
    setDiceOrder(simplifiedLayout ? extendedDiceOrder : defaultDiceOrder);
    setCaption('');
    setPolyhedral(100);

    calculateNoDiceChosen(newDiceRoll);
  }

  const expandExtras = () => {
    let newDiceRoll = Object.assign(diceRoll, { success: 0, advantage: 0, triumph: 0, failure: 0, threat: 0, despair: 0, lightside: 0, darkside: 0 });
    setDiceRoll(newDiceRoll);

    if (diceOrder.length === defaultDiceOrder.length) {
      setDiceOrder(extendedDiceOrder);
    } else {
      setDiceOrder(defaultDiceOrder);
    }

    calculateNoDiceChosen(newDiceRoll);
  }

  const critical = (critical, stop) => {
    stop.preventDefault();
    let critRoll = crit.d100(critModifier);
    let critText = ''
    if (critical === 'critical') {
      critText = crit.crit(critRoll[0]);
    } else {
      critText = crit.shipcrit(critRoll[0]);
    }
    critText = user + ' ' + critRoll[1] + `<p>` + critText + `</p>`
    messageRef.push().set({ text: critText });
    setCritModifier('');
  }

  const roll = (stop) => {
    stop.preventDefault();
    if (params.previousRoll) {
      rollPrevious();
    } else {
      rollNew();
    }

    if (params.callback) {
      params.callback();
    }
  }

  const rollNew = () => {
    let roll = rolldice.roll(diceRoll, polyhedral, caption, user);
    if (roll.text !== undefined) messageRef.push().set(roll);
    if (!saveCheck) {
      reset();
    }
    document.getElementById('newestRoll')?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  const rollPrevious = () => {

    let previousRoll = Object.assign({}, params.previousRoll);
    previousRoll.text = `<span> ${user} modified dice pool </span>`;

    extendedDiceOrder.concat(['polyhedral']).forEach(color => {
      if (previousRoll.roll[color]) {
        if (diceRoll[color]) {
          let toAdd = diceRoll[color] - previousRoll.roll[color].length;
          if (toAdd < 0) {
            previousRoll.roll[color] = decreaseDice(toAdd, previousRoll.roll[color]);
          } else if (toAdd > 0) {
            previousRoll.roll[color] = increaseDice(toAdd, previousRoll.roll[color], color, polyhedral);
          }
        } else {
          previousRoll.roll[color] = decreaseDice(-previousRoll.roll[color].length, previousRoll.roll[color]);
        }
      } else if (diceRoll[color]) {
        previousRoll.roll[color] = increaseDice(diceRoll[color], previousRoll.roll[color], color, polyhedral);
      }
    });

    previousRoll = rolldice.countSymbols(previousRoll, user);
    if (caption !== '') {
      previousRoll.caption = caption;
      previousRoll.text += `<span> ${caption} </span>`;
    }
    if (previousRoll.text !== undefined) {
      messageRef.push().set(previousRoll);
    }
  }

  const destinyRoll = () => {
    let destinyResult = rolldice.roll({ white: 1 }, polyhedral, '', user);
    destinyResult.text += `<br/><span>Adding to the Destiny Pool</span>`;
    switch (diceFaces.white[destinyResult.roll.white[0]].face) {
      case 'l':
        destinyRef.push().set('lightside');
        break;
      case 'll':
        destinyRef.push().set('lightside');
        destinyRef.push().set('lightside');
        break;
      case "n":
        destinyRef.push().set('darkside');
        break;
      case 'nn':
        destinyRef.push().set('darkside');
        destinyRef.push().set('darkside');
        break;
      default:
        break;
    }
    messageRef.push().set(destinyResult);
    document.getElementById('newestRoll')?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  const initiativeRoll = (npcCheck) => {
    let initiativeResult = rolldice.roll(diceRoll, polyhedral, caption, user);
    if (initiativeResult === 0) return;
    let newInit = {};
    newInit.roll = (initiativeResult.results.success - initiativeResult.results.failure).toString() + (initiativeResult.results.advantage - initiativeResult.results.threat).toString() + initiativeResult.results.triumph.toString();
    newInit.bonusDie = { blue: 0, black: 0 };
    if (!npcCheck) {
      newInit.type = 'pc'
      newInit.roll += '1'
    } else {
      newInit.type = 'npc'
      newInit.roll += '0'
    }
    InitiativeRef.push().set(newInit);
    if (initiativeResult.text !== undefined) {
      messageRef.push().set(initiativeResult);
    }
    if (!saveCheck) {
      setDiceRoll({ yellow: 0, green: 0, blue: 0, red: 0, purple: 0, black: 0, white: 0, polyhedral: 0, success: 0, advantage: 0, triumph: 0, failure: 0, threat: 0, despair: 0, lightside: 0, darkside: 0 });
    }
    setCaption('');
    setPolyhedral(100);
  }

  const gleepglop = () => {
    let Species =
      ["Aleena", "Anx", "Aqualish", "Arcona", "Arkanian Offshoot", "Arkanian", "Barabel", "Bardottan", "Besalisk", "Bith", "Bothan", "Caamasi", "Cathar", "Cerean", "Chadra-Fan", "Chagrian", "Chevin", "Chiss", "Clawdite", "Corellian Human", "Dashade", "Defel", "Devaronian", "Drall", "Dressellian", "Droid", "Dug", "Duros", "Elom", "Elomin", "Ewok", "Falleen", "Farghul", "Gamorrean", "Gand", "Gank", "Givin", "Gossam", "Gotal", "Gran", "Gungan", "Herglic", "Human", "Hutt", "Iktotchi", "Ishi Tib", "Ithorian", "Jawa", "Kalleran", "Kel Dor", "Klatooinian", "Kubaz", "Kyuzo", "Lannik", "Lepi", "Mandalorian Human", "Mirialan", "Mon Calamari", "Mustafarian", "Muun", "Nagai", "Nautolan", "Neimoidian", "Nikto", "Noghri", "Ortolan", "Pantoran", "Pau'an", "Polis Massan", "Quarren", "Quermian", "Rodian", "Ryn", "Sakiyan", "Sathari", "Selkath", "Selonian", "Shistavanen", "Sluissi", "Snivvian", "Squib", "Sullustan", "Talz", "Thakwaash", "Togorian", "Togruta", "Toydarians", "Trandoshan", "Twi'lek", "Ubese", "Ugnaught", "Verpine", "Weequay", "Whiphid", "Wookiee", "Xexto", "Zabrak", "Zeltron", "Zygerrian"];
    messageRef.push().set({ text: "A wild " + Species[dice(Species.length) - 1] + " appears!" });

    document.getElementById('newestRoll')?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  return (
    <Container className="top-level-container">
      <Row>
        <Col xs='10' lg='11'><strong>Rolling Dice</strong></Col>
        <Col hidden={simplifiedLayout} className="toggleCornerColumn" xs='2' lg='1'>
          <Button className="toggleCornerButton" title='Click to Show/Hide Symbols' variant={diceOrder.length === defaultDiceOrder.length ? 'primary' : 'light'} onClick={expandExtras.bind(this)}>{diceOrder.length === defaultDiceOrder.length ? <ArrowsAngleExpand></ArrowsAngleExpand> : <ArrowsAngleContract></ArrowsAngleContract>}</Button>
        </Col>
      </Row>
      <Row>
        {diceOrder.map((diceColor) =>
          <Col className={styles.dieColumn} key={diceColor} xs='6' sm='4'>
            <Row className={styles.dieContainer}>
              <Col className={styles.arrowContainer} xs='3'>
                <ButtonGroup vertical className={styles.arrowGroup}>
                  <Button size='sm' className="icon-button-grouped" onClick={addDie.bind(this, diceColor)}><ArrowUp></ArrowUp></Button>
                  <Button size='sm' className="icon-button-grouped" onClick={removeDie.bind(this, diceColor)}><ArrowDown></ArrowDown></Button>
                </ButtonGroup>
              </Col>
              <Col className={styles.dieCount} xs='4'>
                {diceRoll[diceColor]}
              </Col>
              <Col className={styles.die} xs='5'>
                <img
                  className={styles.dieImage}
                  key={diceColor}
                  onClick={addDie.bind(this, diceColor)}
                  src={`/images/${diceColor}.png`}
                  alt={`${diceColor}`} />
              </Col>
            </Row>
          </Col>
        )}
        <Col className={styles.dieColumn} xs='6' md='6' lg='4' xl='4'>
          <Row className={styles.dieContainer}>
            <Col className={styles.arrowContainer} xs='3'>
              <ButtonGroup vertical className={styles.arrowGroup}>
                <Button size='sm' className="icon-button-grouped" onClick={addDie.bind(this, 'polyhedral')}><ArrowUp></ArrowUp></Button>
                <Button size='sm' className="icon-button-grouped" onClick={removeDie.bind(this, 'polyhedral')}><ArrowDown></ArrowDown></Button>
              </ButtonGroup>
            </Col>
            <Col className={styles.dieCount} xs='4'>
              {diceRoll.polyhedral}
            </Col>
            <Col className={styles.textDie} xs='5'>
              <FormControl className={styles.textSides} type='text' size='lg' value={polyhedral} onChange={event => setPolyhedral(event.target.value)} />
            </Col>
          </Row>
        </Col>
        <Col className={styles.dieColumn} hidden={simplifiedLayout} xs='6' md='6' lg='4' xl='4'>
          <Row className={styles.dieContainer}>
            <Col className={styles.arrowContainer} xs='7'>
              <ButtonGroup vertical className={styles.arrowGroup}>
                <Button size='sm' className="icon-button-grouped" onClick={critical.bind(this, 'critical')}>Critical</Button>
                <Button size='sm' className="icon-button-grouped" onClick={critical.bind(this, 'shipcrit')}>Ship Crit</Button>
              </ButtonGroup>
            </Col>
            <Col className={styles.textDie} xs='5'>
              <FormControl className={styles.textSides} type='text' size='lg' value={critModifier} onChange={event => setCritModifier(event.target.value)} placeholder='mod' />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className={styles.rollColumn} lg='6'>
          <Row className={styles.diceActionContainer}>
            <Col className={styles.diceActionContainerElement}>
              <Form onSubmit={roll.bind(this)}>
                <ButtonGroup className={styles.rollButtonGroup} size='lg'>
                  <DropdownButton hidden={simplifiedLayout} className={styles.rollButton} as={ButtonGroup} title="" id="bg-nested-dropdown">
                    <Dropdown.Item eventKey="1" disabled={noDiceChosen} onClick={initiativeRoll.bind(this, false)}>Roll Player Initiative</Dropdown.Item>
                    <Dropdown.Item eventKey="2" onClick={destinyRoll.bind(this)}>Roll Destiny</Dropdown.Item>
                    <Dropdown.Item eventKey="3" onClick={gleepglop.bind(this)}>Gleep Glop</Dropdown.Item>
                    <Dropdown.Item eventKey="4" disabled={noDiceChosen} onClick={initiativeRoll.bind(this, true)}>Roll NPC Initiative</Dropdown.Item>
                  </DropdownButton>
                  <Button disabled={noDiceChosen} className={simplifiedLayout ? styles.pretendFirstRollButton : styles.rollButton} type='submit'>Roll</Button>
                  <FormControl className={styles.captionBox} value={caption} onChange={event => setCaption(event.target.value)} placeholder='Caption'></FormControl>
                </ButtonGroup>
              </Form>
            </Col>
          </Row>
        </Col>
        <Col hidden={simplifiedLayout} className={styles.resetColumn} lg='6'>
          <Row className={styles.diceActionContainer}>
            <Col xs='6' className={styles.diceActionContainerElement}>
              <FormCheck className={styles.switchLg} type='switch' label='Save pool' size='lg' checked={saveCheck} onChange={_ => setSaveCheck(!saveCheck)}></FormCheck>
            </Col>
            <Col xs='6' className={styles.diceActionContainerElement}>
              <Button className={styles.resetButton} variant='danger' size='lg' onClick={reset.bind(this)}><XLg></XLg> Reset</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
export default Dice;
