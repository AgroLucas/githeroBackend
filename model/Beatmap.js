"strict mode";
var Music = require("./Music.js");

const FILE_PATH = __dirname + "/beatmaps.json";
class Beatmap {
    constructor(noteList, difficulty, musicTitle, musicData, songArtist, bmCreator, leaderboard){
        console.log("enter new BM");
        this.noteList = noteList; // array of [noteType(int 0-1), lineNbr(int 0-3), startTime (int ms), endTime(int ms, optionnal)]
        this.creator = bmCreator;
        this.difficulty = difficulty; // String
        console.log("before new Music");
        this.musicObj = new Music(musicTitle, songArtist,  musicData);
        this.leaderboard = leaderboard; // array of 10 * {username: str, score: int}
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
            leaderboard: this.leaderboard,
            musicID: musicID,
        });
        saveBMListToFile(FILE_PATH, beatmapList);
        return beatmapID;
    }

    static getList(){
        return getBMListFromFile(FILE_PATH);
    }

    //returns if there is a beatmap & music stored that matches the beatmapID
    static isBeatmap(beatmapID) {
        if(beatmapID < 0) return false;
        let beatmapList = getBMListFromFile(FILE_PATH);
        if(beatmapID >= beatmapList.length) return false;
        return Music.isMusic(beatmapList[beatmapID].musicID); // is there a music that matches musicID ?
    }

    static getBeatmapFromList(beatmapID) {
        let beatmapList = getBMListFromFile(FILE_PATH);
        if(beatmapID < 0 || beatmapID >= beatmapList.length){
            return;
        }
        let bm = beatmapList[beatmapID];
        let music = Music.getMusicFromList(bm.musicID);
        if(music === null){
            return;
        }
        let res = {
            beatmapID: bm.beatmapID,
            noteList: bm.noteList,
            difficulty: bm.difficulty,
            creator: bm.creator,
            leaderboard: bm.leaderboard,
            musicID: music.musicID,
            musicTitle: music.musicTitle,
            musicArtist: music.musicArtist,
            musicData: music.musicData,
        }
        return res;
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
  
function saveBMListToFile(filePath, bmList) {
    const fs = require("fs");
    let data = JSON.stringify(bmList);
    fs.writeFileSync(filePath, data);
}

module.exports = Beatmap;