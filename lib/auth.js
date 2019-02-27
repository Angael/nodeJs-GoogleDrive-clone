var firebase = require("firebase");
var admin = require("firebase-admin");

var serviceAccount = require("../config/fileupdownload-9d68f-firebase-adminsdk-r12jp-483cc95599.json");

//TODO this could repeat in multiple requires in different files, ok or not ok?
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  /*,
   *databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'*/
});

let auth = {
  /**
   * Checks `Authorization Header` for Token, then returns user data into req.token
   * @property To get User Id use `req.token.uid`
   * @example router.post("/protectedLink", auth.verifyUser, function(req, res) {
   * console.log("user uid:", req.token.uid)
   * }
   */
  verifyUser: function(req, res, next) {
    //if "dev" argument is passed to app
    if (process.argv.includes("dev")) {
      req.token = {
        id: "xuXYnDHt32SgH6YzPKb5X8ClWQe2" //mój id
      };
      next();
      return;
    }

    let idToken = req.get("Authorization");
    if (idToken === undefined || idToken === null || idToken === "") {
      //token is bad
      console.log("error, idToken :", idToken);
      res.sendStatus(400);
      return;
    }
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function(decodedToken) {
        //var uid = decodedToken.uid;
        req.token = decodedToken;
        next();
      })
      .catch(function(error) {
        //TODO: What if token is bad? catch should activate
        console.log("error :", error);
        res.sendStatus(400);
      });
  },
  /**
   * Checks `Get Params` for Token, then returns user data into req.token
   *
   * Note: This version of verifyUser is made for file downloads, where we can't set
   * headers, because ajax call can't download file
   * @param ?token={TokenString}
   * @see `auth.verifyUser`
   * @property To get User Id use `req.token.uid`
   * @example router.get("/protectedLink", auth.verifyUserGet, function(req, res) {
   * console.log("user uid:", req.token.uid)
   * }
   */
  verifyUserGet: function(req, res, next) {
    //if "dev" argument is passed to app
    if (process.argv.includes("dev")) {
      req.token = {
        id: "xuXYnDHt32SgH6YzPKb5X8ClWQe2" //mój id
      };
      next();
      return;
    }

    let idToken = req.query.token;
    if (idToken === undefined || idToken === null || idToken === "") {
      //token is bad
      console.log("error, idToken :", idToken);
      res.sendStatus(400);
      return;
    }
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function(decodedToken) {
        //var uid = decodedToken.uid;
        req.token = decodedToken;
        next();
      })
      .catch(function(error) {
        //TODO: What if token is bad? catch should activate
        console.log("error :", error);
        res.sendStatus(400);
      });
  },
  /**
   * Checks `Post Params` for Token, then returns user data into req.token
   *
   * Note: This version of verifyUser is made for `grouped` file downloads, where we can't set
   * headers, because ajax call can't download file
   * @param: Post param named token
   * @see `auth.verifyUser`
   * @property To get User Id use `req.token.uid`
   * @example router.post("/protectedLink", auth.verifyUserPost, function(req, res) {
   * console.log("user uid:", req.token.uid)
   * }
   */
  verifyUserPost: function(req, res, next) {
    //if "dev" argument is passed to app
    if (process.argv.includes("dev")) {
      req.token = {
        id: "xuXYnDHt32SgH6YzPKb5X8ClWQe2" //mój id
      };
      next();
      return;
    }

    let idToken = req.body.token;
    if (idToken === undefined || idToken === null || idToken === "") {
      //token is bad
      console.log("error, idToken :", idToken);
      res.sendStatus(400);
      return;
    }
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function(decodedToken) {
        //var uid = decodedToken.uid;
        req.token = decodedToken;
        next();
      })
      .catch(function(error) {
        //TODO: What if token is bad? catch should activate
        console.log("error :", error);
        res.sendStatus(400);
      });
  }
};

module.exports = auth;
