import * as firebase from 'firebase';

export default function () {
var user = firebase.auth().currentUser;
var name, uid;

if (user) {
  console.log('old user')
  uid = user.uid;
} else {
  console.log()
  firebase.auth().signInAnonymously();
  uid = user.uid;
}
console.log(name, uid);
return uid;
}
