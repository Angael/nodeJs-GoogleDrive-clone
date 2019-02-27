import { app_firebase } from "./fireBase";
var firebase = app_firebase;
var user = null;

function logOut() {
  firebase.auth().signOut();
}

/**
 * Returns Promise with token {string} that node.js server can decode
 * @example getFirebaseToken().then( (token) => {} )
 */
export function getFirebaseToken() {
  //console.time("getFirebaseToken")
  return firebase
    .auth()
    .currentUser.getIdToken(/* forceRefresh */ false)
    .then(token => {
      //console.timeEnd("getFirebaseToken")
      return token;
    });
}

//TODO: make into promise or callback from it to bind with app.js better
export function initAuth(_startApp) {
  $(".logOut").on("click", logOut);

  firebase.auth().onIdTokenChanged(function(_user) {
    console.log("_user changed:", _user);
    //Change login to account icon or smth
    if (_user) {
      M.toast({
        displayLength: 1500,
        inDuration: 900,
        outDuration: 900,
        html: '<span class="green-text">Logged In Successfully</span>'
      });
      setTimeout(() => {
        M.toast({
          displayLength: 1500,
          inDuration: 900,
          outDuration: 900,
          html: `<span class="blue-text text-lighten-5">Welcome ${
            _user.displayName
          }</span>`
        });
      }, 1100);
      //let's use some relevant js, no jquery
      document.querySelector("#slide-out .user-view .name").innerText =
        _user.displayName;

      document.querySelector("#slide-out .user-view img.circle").src =
        _user.photoURL;

      //start only after we already have uid
      if (user === null) {
        _startApp();
      }
      user = _user;
      // User is signed in.
    } else {
      user = null;
      // uid_decoded = undefined;
      alert("not logged in, redirecting...");
      window.location.replace("login");
    }
  });
}
