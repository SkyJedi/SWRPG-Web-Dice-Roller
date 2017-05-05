import * as firebase from 'firebase';
import config from './config'

firebase.initializeApp(config.config);
var database = firebase.database().ref()

export default {
  updateDB: (child, infoUpdate) => {
    database.child(child).set(infoUpdate);
  },

}
