import React from 'react';
import { Button, Col, Container, Form, Image, Row } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import Cookies from 'universal-cookie';
import About from './About';
import styles from './Channel.module.scss';

const Channel = (callback) => {

  const [cookies, setCookie] = useCookies(['channel', 'user']);

  const [myCookies, setMyCookies] = React.useState(cookies.channel !== undefined);
  const [channel, setChannel] = React.useState(cookies.channel || '');
  const [user, setUser] = React.useState(cookies.user || '');

  const handleSubmit = (event) => {
    event.preventDefault();
    let normalizedChannel = channel.replace(/\W/g, '').toLowerCase();
    let normalizedUser = user.replace(/\W/g, '');

    if (myCookies) {
      // User wishes to use cookies: set channel name and user name for next visit; expire in one year
      setCookie('channel', normalizedChannel, { path: '/', maxAge: 60 * 60 * 24 * 366, sameSite: 'strict', secure: true });
      setCookie('user', normalizedUser, { path: '/', maxAge: 60 * 60 * 24 * 366, sameSite: 'strict', secure: true });
    } else {
      // User does not wish to use cookies; remove existing ones if present
      const cookies = new Cookies();
      cookies.remove('channel', { path: '/' });
      cookies.remove('user', { path: '/' });
    }

    callback.setChannelUser(normalizedChannel, normalizedUser);
  }

  return (
    <Container>
      <Row>
        <Col xs={{ span: 10, offset: 1 }} sm={{ span: 8, offset: 2 }} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className={styles.loginBody}>
          <h1 className="text-center"><strong>D1-C3</strong></h1>
          <Image className={styles.d1c3} src={`/favicon.png`} alt="D1-C3 droid" />
          <Form className={styles.loginForm} onSubmit={handleSubmit}>
            <Form.Control size="lg" id="channel" type="text" placeholder="Channel Name"
              value={channel}
              onChange={e => setChannel(e.target.value)}
            />
            <Form.Control size="lg" id="user" type="user" placeholder="User Name"
              value={user}
              onChange={e => setUser(e.target.value)}
            />
            <Form.Check size="lg" type="checkbox" id='useCookieCheck' label="Save for next visit as cookie"
              checked={myCookies}
              onChange={_ => setMyCookies(!myCookies)}
            />
            <Button size="lg" variant="primary" type='submit'>Enter</Button>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col className={styles.footer}>
          <About />
        </Col>
      </Row>
    </Container>
  );
}

export default Channel;