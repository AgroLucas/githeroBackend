const JWT = require("jsonwebtoken");
const JWTSECRET = "mySUPERsecrectJWTprivatekey!";
const JWTLIFETIME= 60 * 20; // en seconde 

const User = require("../model/User.js");



/**
 * Authorize middleware to be used on the routes to be secured
 */

const authorize = (request,response,next) => {
  let token = request.get("Authorization"); //client should send his token to the server via http request 
  console.log("Middleware authorize: token received by header Authorization is" + token);
   JWT.verify(token, JWTSECRET, (error, token) => {
    if (error) {
      console.error("JWT.verify error:" + error.message);
      response.status(401); // pas authorisé
    }else{
      let user = User.getUserFromList(token.username);
      if(!user){
        console.log("JWT.verify error: user in the JWT Token not found .");
      response.status(401); // pas authorisé
      }else{
        next(); // appel le prochain middleware
      }
    }
  });
};

module.exports = { JWTSECRET,JWTLIFETIME,authorize};
