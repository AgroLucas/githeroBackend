let express= require("express");
let router = express.Router();

const JWT = require("jsonwebtoken");
const { response } = require("../app.js");
const {JWTSECRET , JWTLIFETIME , authorize} = require ("../utils/auth.js");
let User = require("../model/User.js");
/* GET user list : secure the route with JWT authorization */
router.get("/", authorize, function (req, res, next) {
    return res.json(User.list);
});
//REGISTER
//POST /api/users/
router.post("/", async function (request,response) {
  if(User.isUser(request.body.email)){
    response.status(409).end(); // si conflict
  }else{
    let user = new User(request.body.email, request.body.email, request.body.password);
   try{
     await newUser.save(); // attendre resolution promesse de sauvgarde
    newUser.save();
    JWT.sign(
      {username: newUser.username }, //Payload
      JWTSECRET, //  PRIVATE KEY
      { expiresIn: JWTLIFETIME },
      (err, token) => { //callback
        if (error) {
          console.error("JWT.sign error:", error);
          response.status(500).end(); // Serveur erreur
        }else{
          console.log("JWT.sign OK:", token);
          response.json({ username: newUser.username, token });
          //username retourné au client pour gerer son affichage et token envoyé au client , a lui de sauvgarder pour
          //utilier des futures requetes necessitant une autorisation
          //SPA est ainsi stateless
      }
    }
    );
  }  catch(error){
     console.log(error);
     response.status(500).end(); // serveur erreur
  };
  }
  } );

 //LOGIN
 //POST /api/login
 router.post("/login",async function(request,response){
   let user =new User(request.body.email, request.body.email, request.body.password);
   try{ 
     let match = await user.checkCredentials(request.body.email, request.body.password);
   if(match){
     JWT.sign(
      {username: user.username }, 
      JWTSECRET, 
      { expiresIn: JWTLIFETIME },
      (err, token) => { 
        if (error) {
          console.error("JWT.sign error:", error);
          response.status(500).end(); // Serveur erreur
        }
          console.log("JWT.sign OK, token:", token);
          response.json({ username: newUser.username, token });
          //username retourné au client pour gerer son affichage et token envoyé au client , a lui de sauvgarder pour
          //utilier des futures requetes necessitant une autorisation
          //SPA est ainsi stateless
      }
     );
   }else{
     response.status(401).end(); // pas authorisé
   }
  } catch (error){
    console.log(error);
    response.status(401).end();
  };
 });

//USERS LIST
//GET /api/users/
// avec my auth JWT middleware


router.get("/", authorize , function (request , response) {
 response.json({ userList: User.list });
  });

  module.exports = router;

