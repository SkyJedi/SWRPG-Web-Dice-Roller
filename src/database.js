import * as firebase from 'firebase';
import config from './config'

firebase.initializeApp(config.config);
var database = firebase.database().ref()

export default {
  
}
