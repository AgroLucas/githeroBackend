"use strict";
const BCRYPT = require("bcrypt");
const { getMaxListeners } = require("process");
const SALTROUNDS = 10;
const DEFAULT_FILE_PATH = __dirname + "/defaultUsers.json";
const FILE_PATH = __dirname + "/users.json";



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
  //compte admin :
  //username : admin
  //password : !Admin123!
  

  /* return a promise with async / await */ 
  async save() {
    console.log('Promise save pending');
    let userList = getUserListFromFile(FILE_PATH);
    try{
      console.log('Promise BCRYPT.hash pending');
      let hashedPassword = await BCRYPT.hash(this.password, SALTROUNDS); //async attendre return de hash
      console.log('Promise BCRYPT.hash fulfilled, hashedPassword :', hashedPassword);
      userList.push({username: this.username, email: this.email, password: hashedPassword, highscores: this.highscores, isAdmin: false});
      saveUserListToFile(FILE_PATH,userList);
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
    console.log("User:", userFound, ",  password:", password);
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
  static isAdmin(username) {
    let userFound = User.getAdminFromList(username);
    return userFound !== undefined;
   }
   static getAdminFromList(username) {
    const adminList = getAdminListFromFile(FILE_PATH); // a verifier 
    for (let index = 0; index < adminList.length; index++) {
      if (adminList[index].username === username && username.isAdmin ===true) return adminList[index];
    }
    return;
  }
  
   static getUserFromList(username) {
    const userList = getUserListFromFile(FILE_PATH); // a verifier
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].username === username) return userList[index];
    }
    return;
  }
  
  static getHighscore(username, idBeatMap) { 
    let user = User.getUserFromList(username);
    let result;
    user.highscores.every( scores => {
      if (scores.idBeatMap == idBeatMap ) {
        result = scores.highscore;
        return false;
      }
      return true;
    });
    return result;
  }
  
  static setHighscore(username, idBeatMap, highscore) {
    let list = getUserListFromFile(FILE_PATH);
    list.forEach(element => {
      if (element.username === username) {
        let flag;
        element.highscores.every(scores => {
          if (scores.idBeatMap === idBeatMap) {
            flag = "false";
            scores.highscore = highscore;
            return false;
          }
          return true;
        });
        if (typeof(flag) === "undefined") {
          let score = {};
          score.idBeatMap = idBeatMap;
          score.highscore = highscore;
          element.highscores.push(score);
        }
      }
    });
    saveUserListToFile(FILE_PATH, list);
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
function saveAdminListToFile(filePath, adminList) {
  const fs = require("fs");
  let data = JSON.stringify(adminList);
  fs.writeFileSync(filePath, data);
}

function saveUserListToFile(filePath, userList) {
  const fs = require("fs");
  let data = JSON.stringify(userList);
  fs.writeFileSync(filePath, data);
}



module.exports = User;
