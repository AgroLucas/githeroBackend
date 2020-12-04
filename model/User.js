"strict mode";
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "145OkyayNo668Pass";
const FILE_PATH = __dirname + "/users.json";

class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  /* return a promise with async / await */ 
  async save() {
    console.log('Promise save pending');
    let userList = getUserListFromFile(USER_FILE);
    try{
      console.log('Promise BCRYPT.hash pending');
      let hashedPassword = await bcrypt.hash(this.password, SALTROUNDS); //async attendre return de hash
      console.log('Promise BCRYPT.hash fulfilled, hashedPassword :', hashedPassword);
      userList.push({username: this.email, email: this.email, password: hashedPassword});
      saveUserListToFile(USER_FILE,userList);
      console.log('Promise save fulfilled');
      return Promise.resolve(true);
    }catch(error){
      console.log('Promise save rejected :', error);
      return Promise.reject('Promise save rejected : error in BCRYPT.hash or saveUserListToFile');
    };

    }
  

  /* return a promise with classic promise syntax*/
  async checkCredentials(email, password) {
   console.log('Promise checkCredentials pending');
    if (!email || !password) {
      return Promise.reject('Promise checkCredentials rejected : no email or no password');
    }

    let userFound = User.getUserFromList(email);
    console.log("User:", userFound, " password:", password);
    if (!userFound){
      return Promise.reject('Promise checkCredentials rejected : user not found');
   } 
   try{
     console.log('Promise BCRYPT.compare pending');
     let match = await bcrypt.compare(password,userFound.password); //async
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

  // Some example of bcrypt used with sync function
  /*
  save() {
    let userList = getUserListFromFile(FILE_PATH);
    const hashedPassword = bcrypt.hashSync(this.password, saltRounds);

    userList.push({
      username: this.email,
      email: this.email,
      password: hashedPassword,
    });

    saveUserListToFile(FILE_PATH, userList);
  }

  checkCredentials(email, password) {
    if (!email || !password) return false;
    let userFound = User.getUserFromList(email);
    console.log("User::checkCredentials:", userFound, " password:", password);
    if (!userFound) return false;
    const match = bcrypt.compareSync(password, userFound.password);
    return match;
  }*/

  static get list() {
    let userList = getUserListFromFile(USER_FILE);
    return userList;
  }

  static isUser(username) {
   let userFound = User.getUserFromList(username);
   return userFound !== undefined;
  }

  static getUserFromList(username) {
    const userList = getUserListFromFile(FILE_PATH);
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].username === username) return userList[index];
    }
    return;
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

function saveUserListToFile(filePath, userList) {
  const fs = require("fs");
  let data = JSON.stringify(userList);
  fs.writeFileSync(filePath, data);
}

module.exports = User;
