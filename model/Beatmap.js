"strict mode";
var Music = require("./Music.js");
const User = require("./User.js");

const FILE_PATH = __dirname + "/beatmaps.json";
const LEADERBOARD_FILE_PATH = __dirname + "/leaderboards.json";
const DEFAULT_FILE_PATH = __dirname + "/defaultBeatmaps.json";
const LEADERBOARD_SIZE = 5;
class Beatmap {
    constructor(noteList, difficulty, musicTitle, musicData, songArtist, musicDuration, bmCreator){
        this.noteList = noteList; // array of [noteType(int 0-1), lineNbr(int 0-3), startTime (int ms), endTime(int ms, optionnal)]
        this.creator = bmCreator;
        this.difficulty = difficulty; // String
        this.musicObj = new Music(musicTitle, songArtist,  musicData, musicDuration);
    }

    save() {
        let musicID = this.musicObj.save();
        let beatmapList = getBMListFromFile(FILE_PATH);
        let beatmapID = beatmapList.length;
        beatmapList.push({
            beatmapID: beatmapID,
            noteList: this.noteList,
            difficulty: this.difficulty,
            creator: this.creator,
            musicID: musicID,
        });
        saveToFile(FILE_PATH, beatmapList);
        return beatmapID;
    }

    //Return list of beatmap
    static getList(username){
        let list = getBMListFromFile(DEFAULT_FILE_PATH).concat(getBMListFromFile(FILE_PATH)); //list = Default + Published beatmaps
        return list.map(item => {
            const data = Beatmap.getBeatmapFromList(item.beatmapID);
            let highscore = 0;
            if(username !== "null")
                highscore = User.getHighscore(username, data.beatmapID);
        
            return {
                beatmapID: data.beatmapID,
                musicTitle: data.musicTitle,
                musicArtist: data.musicArtist,
                musicDuration: data.musicDuration,
                creator: data.creator,
                difficulty: data.difficulty,
                leaderboard: data.leaderboard,
                highscore: highscore ? highscore : 0
            }
        });
    }

    //returns if there is a beatmap & music stored that matches the beatmapID (+musicID inside beatmap)
    static isBeatmap(beatmapID) {
        if(beatmapID < 0) { //neg ID -> default ?
            let defaultBeatmapList = getBMListFromFile(DEFAULT_FILE_PATH);
            for(let i=0; i<defaultBeatmapList.length; i++){
                if(defaultBeatmapList[i].beatmapID == beatmapID){
                    return Music.isMusic(defaultBeatmapList[i].musicID); // BM found -> is there a music that matches musicID ?
                }
            }
            return false; //no default bm found
        }
        let beatmapList = getBMListFromFile(FILE_PATH); //positive ID -> published ?
        if(beatmapID >= beatmapList.length) return false;
        return Music.isMusic(beatmapList[beatmapID].musicID); // BM found -> is there a music that matches musicID ?
    }

    static getBeatmapFromList(beatmapID) {
        let bm;
        if(beatmapID >= 0){ //published
            let beatmapList = getBMListFromFile(FILE_PATH);
            if(beatmapID < 0 || beatmapID >= beatmapList.length){
                return;
            }
            bm = beatmapList[beatmapID];
        }else { //default
            let defaultBeatmapList = getBMListFromFile(DEFAULT_FILE_PATH);
            let i=0;
            while(i<defaultBeatmapList.length && !bm){
                if(defaultBeatmapList[i].beatmapID == beatmapID){
                    bm = defaultBeatmapList[i];
                }
                i++;
            }
        }
        let music = Music.getMusicFromList(bm.musicID);
        let leaderboard = this.getLeaderboardFromBeatmapID(beatmapID);
        if(music === null){
            return;
        }
        let res = {
            beatmapID: bm.beatmapID,
            noteList: bm.noteList,
            difficulty: bm.difficulty,
            creator: bm.creator,
            leaderboard: leaderboard,
            musicID: music.musicID,
            musicTitle: music.title,
            musicArtist: music.artist,
            musicData: music.data,
            musicDuration: music.duration,
        }
        return res;
    }

    static getLeaderboardFromBeatmapID(beatmapID){
        let lbMap = getLBMapFromFile(LEADERBOARD_FILE_PATH);
        if(!lbMap[beatmapID]){
            return []; //empty leaderboard
        }
        return lbMap[beatmapID];
    }

    static updateLeaderboard(beatmapID, score, username){
        let leaderboard = this.getLeaderboardFromBeatmapID(beatmapID);
        let i = leaderboard.length-1;
        if(leaderboard.length != 0){ 
            while(i >= 0 && leaderboard[i].score < score){
                i--;
            }
            i++;
            if(i>=LEADERBOARD_SIZE){
                return; // not in leaderboard
            }
        }else { //empty lb. => 1rst place 
            i=0;
        }
        let entry = {
            score: score,
            username: username,
        }
        leaderboard.splice(i, 0, entry); // insert entry in 
        while(leaderboard.length > LEADERBOARD_SIZE){
            leaderboard.splice(leaderboard.length-1, 1); //remove eccess entries
        }

        let lbMap = getLBMapFromFile(LEADERBOARD_FILE_PATH);
        lbMap[beatmapID]=leaderboard;
        saveToFile(LEADERBOARD_FILE_PATH, lbMap);
    }
}

function getBMListFromFile(filePath) {
    const fs = require("fs");
    if (!fs.existsSync(filePath)) return [];
    let bmListRawData = fs.readFileSync(filePath);
    let bmList;
    if (bmListRawData) bmList = JSON.parse(bmListRawData);
    else bmList = [];
    return bmList;
}
  
function saveToFile(filePath, data) {
    const fs = require("fs");
    let jsonData = JSON.stringify(data);
    fs.writeFileSync(filePath, jsonData);
}

function getLBMapFromFile(filePath) {
    const fs = require("fs");
    if(!fs.existsSync(filePath)) return {};
    let lbListRawData = fs.readFileSync(filePath);
    let lbList;
    if(lbListRawData) lbList = JSON.parse(lbListRawData);
    else lbList = [];
    return lbList;
}

module.exports = Beatmap;