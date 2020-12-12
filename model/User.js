"use strict";
const BCRYPT = require("bcrypt");
const { getMaxListeners } = require("process");
const SALTROUNDS = 10;
const DEFAULT_FILE_PATH = __dirname + "/defaultUsers.json";
const FILE_PATH = __dirname + "/users.json";
const HIGHSCORE_FILE_PATH = __dirname + "/highscores.json";



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
    console.log('Promise save pending');
    let userList = getUserListFromFile(FILE_PATH);
    try{
      console.log('Promise BCRYPT.hash pending');
      let hashedPassword = await BCRYPT.hash(this.password, SALTROUNDS); //async attendre return de hash
      console.log('Promise BCRYPT.hash fulfilled, hashedPassword :', hashedPassword);
      userList.push({username: this.username, email: this.email, password: hashedPassword, highscores: this.highscores, isAdmin: false});
      saveToFile(FILE_PATH,userList);
      console.log('Promise save fulfilled');
      return Promise.resolve(true);
    }catch(error){
      console.log('Promise save rejected :', error);
      return Promise.reject('Promise save rejected : error in BCRYPT.hash or saveUserListToFile');
    };

    }
  

  /* return a promise with classic promise syntax*/
  async checkCredentials(username, password) {
   console.log('Promise checkCredentials pending');
    if (!username || !password) {
      return Promise.reject('Promise checkCredentials rejected : no email or no password');
    }

    let userFound = User.getUserFromList(username);
    if (!userFound){
      return Promise.reject('Promise checkCredentials rejected : user not found');
   } 
   try{
     console.log('Promise BCRYPT.compare pending');
     let match = await BCRYPT.compare(password,userFound.password); //async
     console.log('Promise BCRYPT.compare fulfilled, match :', match);
     if (match){
       return Promise.resolve(true);
     }else{
       return Promise.resolve(false);
     }
    }catch (error) {
      console.log('Promise BCRYPT.compare rejected :', error);
      return Promise.reject('Promise checkCredentials rejected : error in BCRYPT.compare');
    };
  }

  static get list() {
    let userList = getUserListFromFile(DEFAULT_FILE_PATH).concat(getUserListFromFile(FILE_PATH)); // user par default + inscrit
    return userList;
  }
  static get adminList() {
    let adminList = getAdminListFromFile(DEFAULT_FILE_PATH).concat(getAdminListFromFile(FILE_PATH));
    return adminList;
  }


  static isUser(username) {
   let userFound = User.getUserFromList(username);
   return userFound !== undefined;
  }
  
   static getUserFromList(username) {
    const userList = getUserListFromFile(DEFAULT_FILE_PATH).concat(getUserListFromFile(FILE_PATH)); // a verifier
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].username === username) return userList[index];
    }
    return;
  }
  
  //don't use to check before setHighscore (check already built in setHighscore)
  static getHighscore(username, idBeatMap) { 
    /*let user = User.getUserFromList(username);
    let result;
    user.highscores.every( scores => {
      if (scores.idBeatMap == idBeatMap ) {
        result = scores.highscore;
        return false;
      }
      return true;
    });
    return result;*/
    let highscoreList = getHighscoreMap(HIGHSCORE_FILE_PATH);
    let userIndex = searchUserHSIndex(username, highscoreList);
    if(userIndex === -1) {
      console.log("no highscore from user, return 0");
      return 0; //no highscore from user
    }

    let userHighscores = highscoreList[userIndex].allHighscores;
    let bmIndex = searchBMHighscoreIndex(idBeatMap, userHighscores);
    if(bmIndex === -1) {
      console.log("no highscore on this beatmap from user, return 0");
      return 0; // no highscore from user on idBeatMap
    }

    console.log("highscore found");
    return userHighscores[bmIndex].highscore; // highscore found
  }

  //returns boolean
  static setHighscore(username, idBeatMap, highscore) {
    let highscoreList = getHighscoreMap(HIGHSCORE_FILE_PATH);

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
      console.log("new entry: ", highscoreList);
      return true;
    }

    //previous entry found
    if(highscoreList[userIndex].allHighscores[bmIndex].highscore >= highscore) return false; //old entry has greater h.s. than current one
    highscoreList[userIndex].allHighscores[bmIndex].highscore = highscore;
    saveToFile(HIGHSCORE_FILE_PATH, highscoreList);
    console.log("modified old entry: ",highscoreList);
    return true;
  }

  static getTotalScoreboard() {
    let list = getUserListFromFile(FILE_PATH);
    return list.map(user => {
      return {
        username: user.username,
        totalHighscore: user.highscores.reduce((total, score) => total + score.highscore, 0)
      }
    }).sort((a,b) => b.totalHighscore - a.totalHighscore); 
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

function getAdminListFromFile(filePath) {
  const fs = require("fs");
  if (!fs.existsSync(filePath)) return [];
  let adminListRawData = fs.readFileSync(filePath);
  let adminList;
  if (adminListRawData) adminList = JSON.parse(adminListRawData);
  else adminList = [];
  return adminList;
}

function saveToFile(filePath, data) {
  console.log("data: ", data);
  const fs = require("fs");
  let jsonData = JSON.stringify(data);
  console.log("jsonData: ", jsonData);
  fs.writeFileSync(filePath, jsonData);
}

function getHighscoreMap(filePath) {
  const fs = require("fs");
  if(!fs.existsSync(filePath)) return [];
  let highscoreMapRawData = fs.readFileSync(filePath);
  let highscoreMap;
  if(highscoreMapRawData) highscoreMap = JSON.parse(highscoreMapRawData);
  else highscoreMap = [];
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

module.exports = User;
