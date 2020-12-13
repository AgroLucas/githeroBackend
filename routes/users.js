"use strict"
let express= require("express");
let router = express.Router();

const JWT = require("jsonwebtoken");
const {JWTSECRET , JWTLIFETIME , authorize} = require ("../utils/auth.js");

let User = require("../model/User.js");
let Beatmap = require("../model/Beatmap.js");

//REGISTER
//POST /api/users/
router.post("/", async function (request,response) {
  if(User.isUser(request.body.username) || User.isUser(request.body.email)){
    response.status(409).end(); // if conflict
  }else{
    let newUser = new User(request.body.username, request.body.email, request.body.password,request.body.highscore,request.body.isAdmin);
   try{
     await newUser.save(); // wait for resolution promise to save
    JWT.sign(
      {username: newUser.username }, //Payload
      JWTSECRET, //  PRIVATE KEY
      { expiresIn: JWTLIFETIME },
      (error, token) => { //callback
        if (error) {
          console.error("JWT.sign error:", error);
          response.status(500).end(); // Server error
        }else{
          console.log("JWT.sign OK");
          response.json({ username: newUser.username, token });
          // username returned to the client to manage his display and token sent to the client, he has to save for
          // use future requests requiring authorization
          //// SPA is therefore stateless
      }
    }
    );
  }  catch(error){
     console.log(error);
     response.status(500).end(); // Server error
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
          response.status(500).end(); // Server error
        }else{
          console.log("JWT.sign OK");
          response.json({ username: user.username, token });
          //username returned to the client to manage his display and token sent to the client, he has to save for
          //use future requests requiring authorization
          //SPA is  stateless
        }
      }
     );
   }else{
     response.status(401).end(); // not authorized
   }
  } catch (error){
    console.log(error);
    response.status(401).end();
  };
 });

router.post("/score", authorize , function (request , response) {
  let oldHighscore = User.getHighscore(request.body.username, request.body.beatmapId);
  if(User.setHighscore(request.body.username, request.body.beatmapId, request.body.score)){
    Beatmap.updateLeaderboard(request.body.beatmapId, request.body.score, request.body.username);
  }
  response.json({ oldHighscore: oldHighscore });
  });

  router.get("/totalscore", function(request, response) {
    response.json({totalscore: User.getTotalScoreboard() });
  })

  router.post("/isAdmin", authorize, (request, res)=>{
    res.json({isAdmin: User.isAdmin(request.body.username)});
  });


  module.exports = router;

