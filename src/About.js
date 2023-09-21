import React from 'react';
import { Image } from 'react-bootstrap';
import styles from './About.module.scss';

const About = () => {
  return (
    <div className={styles.footer}>
      <p>Created by SkyJedi and others on <a href="https://github.com/SkyJedi/SWRPG-Web-Dice-Roller" target="_blank" rel="noopener noreferrer"><Image className={styles.textInlineImage} src={`/github-mark.svg`} alt="GitHub Logo" />GitHub</a></p>
      <p>Questions? Comments? <a href="mailto:skyjedi@gmail.com?subject=D1-C3%20Feedback" target="_blank" rel="noopener noreferrer">Contact Me</a></p>
      <p><a href="https://paypal.me/SkyJedi" target="_blank" rel="noopener noreferrer">Donate</a></p>
      <small>An assistant (dice roller, chat, destiny tracker, character tracker, initiative tracker) for <a href='http://fantasyflightgames.com/' target="_blank" rel="noopener noreferrer">Fantasy Flight Games</a>, Star Wars: Edge of the Empire, Age of Rebellion, and Force and Destiny</small>
    </div>
  )
}
export default About;
