"use strict";
const BCRYPT = require("bcrypt");
const SALTROUNDS = 10;
const DEFAULT_FILE_PATH = __dirname + "/defaultUsers.json";
const FILE_PATH = __dirname + "/users.json";
const HIGHSCORE_FILE_PATH = __dirname + "/highscores.json";
var Util = require("../utils/util.js");



class User {
  constructor(username, email, password, highscores, isAdmin) {
    this.username = username;
    this.email = email;
    this.password = password;
    if (!highscores)
      this.highscores = [];
    else 
      this.highscores = highscores
    this.isAdmin = false
  }
  
  

  /* return a promise with async / await */ 
  async save() {
    let userList = getUserListFromFile(FILE_PATH);
    try{
      let hashedPassword = await BCRYPT.hash(this.password, SALTROUNDS); //async attendre return hash
      userList.push({username: this.username, email: this.email, password: hashedPassword, highscores: this.highscores, isAdmin: false});
      saveToFile(FILE_PATH,userList);
      return Promise.resolve(true);
    }catch(error){
      return Promise.reject('Promise save rejected : error in BCRYPT.hash or saveUserListToFile');
    };

    }
  

  /* return a promise with classic promise syntax*/
  async checkCredentials(username, password) {
    if (!username || !password) {
      return Promise.reject('Promise checkCredentials rejected : no email or no password');
    }

    let userFound = User.getUserFromList(username);
    if (!userFound){
      return Promise.reject('Promise checkCredentials rejected : user not found');
   } 
   try{
     let match = await BCRYPT.compare(password,userFound.password); //async
     if (match){
       return Promise.resolve(true);
     }else{
       return Promise.resolve(false);
     }
    }catch (error) {
      return Promise.reject('Promise checkCredentials rejected : error in BCRYPT.compare');
    };
  }

  static get list() {
    let userList = getUserListFromFile(DEFAULT_FILE_PATH).concat(getUserListFromFile(FILE_PATH)); // user default + registration
    return userList;
  }
  
  static isUser(username) {
   let userFound = User.getUserFromList(username);
   return userFound !== undefined;
  }
  
   static getUserFromList(username) {
    const userList = getUserListFromFile(DEFAULT_FILE_PATH).concat(getUserListFromFile(FILE_PATH)); 
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].username === username) return userList[index];
    }
    return;
  }
  
  //don't use to check before setHighscore (check already built in setHighscore)
  static getHighscore(username, idBeatMap) { 
    let highscoreList = getHighscoreList(HIGHSCORE_FILE_PATH);
    let userIndex = searchUserHSIndex(username, highscoreList);
    if(userIndex === -1) {
      return 0; //no highscore from user
    }

    let userHighscores = highscoreList[userIndex].allHighscores;
    let bmIndex = searchBMHighscoreIndex(idBeatMap, userHighscores);
    if(bmIndex === -1) {
      return 0; // no highscore from user on idBeatMap
    }

    return userHighscores[bmIndex].highscore; // highscore found
  }

  //returns boolean
  static setHighscore(username, idBeatMap, highscore) {
    let highscoreList = getHighscoreList(HIGHSCORE_FILE_PATH);

    let userIndex = searchUserHSIndex(username, highscoreList);

    if(userIndex === -1) { //user not previously in highscoreList
      let entry = {
        username: username,
        allHighscores: [],
      }
      userIndex = highscoreList.push(entry) -1;
    }

    let bmIndex = searchBMHighscoreIndex(idBeatMap, highscoreList[userIndex].allHighscores);
  
    if(bmIndex === -1){ //no previous entry
      let entry = {
        idBeatMap: idBeatMap,
        highscore: highscore,
      };
      highscoreList[userIndex].allHighscores.push(entry);
      saveToFile(HIGHSCORE_FILE_PATH, highscoreList);
      return true;
    }

    //previous entry found
    if(highscoreList[userIndex].allHighscores[bmIndex].highscore >= highscore) return false; //old entry has greater h.s. than current one
    highscoreList[userIndex].allHighscores[bmIndex].highscore = highscore;
    saveToFile(HIGHSCORE_FILE_PATH, highscoreList);
    return true;
  }

  static getTotalScoreboard() {
    let list = getHighscoreList(HIGHSCORE_FILE_PATH);
    return list.map(userEntry => {
      return {
        username: userEntry.username,
        totalHighscore: userEntry.allHighscores.reduce((total, score) => total + score.highscore, 0)
      }
    }).sort((a,b) => b.totalHighscore - a.totalHighscore); 
  }

  static isAdmin(username) {
    let user = User.getUserFromList(username);
    if (user && user.isAdmin)
      return true;
    return false;
  }
  
  //clears all highscores from a certain beatmap
  static clearHighscoresFrom(beatmapID) {
    let highscoreList = getHighscoreList(HIGHSCORE_FILE_PATH);

    for(let userIndex = 0; userIndex<highscoreList.length; userIndex++){
      let removal = false;
      let highscoreUserList = highscoreList[userIndex].allHighscores;
      let entryIndex = 0;
      while(entryIndex <highscoreUserList.length && !removal){
        if(highscoreUserList[entryIndex].idBeatMap == beatmapID){
          highscoreList[userIndex].allHighscores.splice(entryIndex, 1);
          removal = true;
        }
        entryIndex++;
      }
    }

    saveToFile(HIGHSCORE_FILE_PATH, highscoreList);
  }

}

  function getUserListFromFile(filePath) {
  const fs = require("fs");
  if (!fs.existsSync(filePath)) return [];
  let userListRawData = fs.readFileSync(filePath);
  let userList;
  if (userListRawData) userList = JSON.parse(userListRawData);
  else userList = [];
  return userList;
}


function saveToFile(filePath, data) {
  const fs = require("fs");
  let jsonData = JSON.stringify(data);
  fs.writeFileSync(filePath, jsonData);
}

function getHighscoreList(filePath) {
  const fs = require("fs");
  if(!fs.existsSync(filePath)) return [];
  let highscoreMapRawData = fs.readFileSync(filePath);
  let highscoreMap;

  if(highscoreMapRawData) {
    highscoreMap = JSON.parse(highscoreMapRawData);   
    for (let i = 0; i < highscoreMap.length; i++)
      highscoreMap[i].allHighscores = highscoreMap[i].allHighscores.filter(isNotBlocked);
  }
  else 
    highscoreMap = [];
  return highscoreMap;
}

//searches through one user's h.s. list returns the index of the beatmap's entry (or -1)
function searchBMHighscoreIndex(beatmapID, userHighscoreList) {
  for(let i=0; i<userHighscoreList.length; i++){
    let entry = userHighscoreList[i];
    if(entry.idBeatMap == beatmapID){
      return i;
    }
  }
  return -1;
}

function searchUserHSIndex(username, highscoreList) {
  for(let i=0; i<highscoreList.length; i++){
    let entry = highscoreList[i];
    if(entry.username === username){
      return i;
    }
  }
  return -1;
}

function isNotBlocked(highscore) {
    if (highscore.idBeatMap >= 0 && !Util.getActive(highscore.idBeatMap))
      return false;
    return true;
}


module.exports = User;
