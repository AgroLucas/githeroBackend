"use strict"
let express= require("express");
let router = express.Router();

const JWT = require("jsonwebtoken");
const {JWTSECRET , JWTLIFETIME , authorize} = require ("../utils/auth.js");

let User = require("../model/User.js");

//REGISTER
//POST /api/users/
router.post("/", async function (request,response) {
  if(User.isUser(request.body.username) || User.isUser(request.body.email)){
    response.status(409).end(); // si conflict
  }else{
    let newUser = new User(request.body.username, request.body.email, request.body.password,request.body.highscore,request.body.isAdmin);
   try{
     await newUser.save(); // attendre resolution promesse de sauvgarde
    newUser.save();
    JWT.sign(
      {username: newUser.username }, //Payload
      JWTSECRET, //  PRIVATE KEY
      { expiresIn: JWTLIFETIME },
      (error, token) => { //callback
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
   let user =new User(request.body.username, request.body.email, request.body.password,request.body.highscore,request.body.isAdmin);
   try{ 
     let match = await user.checkCredentials(request.body.username, request.body.password);
   if(match){
     JWT.sign(
      {username: user.username }, 
      JWTSECRET, 
      { expiresIn: JWTLIFETIME },
      (error, token) => { 
        if (error) {
          console.error("JWT.sign error:", error);
          response.status(500).end(); // Serveur erreur
        }else{
          console.log("JWT.sign OK, token:", token);
          response.json({ username: user.username, token });
          //username retourné au client pour gerer son affichage et token envoyé au client , a lui de sauvgarder pour
          //utilier des futures requetes necessitant une autorisation
          //SPA est ainsi stateless
        }
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

router.post("/score", authorize , function (request , response) {                 //TODO authorize doesn't work
  let highscore = User.getHighscore(request.body.username, request.body.beatmapId);
  if (!highscore) 
    highscore = 0;
  if (highscore < request.body.score)
    User.setHighscore(request.body.username, request.body.beatmapId, request.body.score);
  response.json({ oldHighscore: highscore });
  });


  module.exports = router;

