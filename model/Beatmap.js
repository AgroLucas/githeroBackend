"strict mode";
import Music from "./Music.js";

const FILE_PATH = __dirname + "/beatmaps.json";
class Beatmap {
    constructor(noteList, difficulty, musicTitle, musicData, songArtist, bmCreator, leaderboard){
        this.noteList = noteList; // array of [noteType(int 0-1), lineNbr(int 0-3), startTime (int ms), endTime(int ms, optionnal)]
        this.creator = bmCreator;
        this.difficulty = difficulty; // int
        this.musicObj = new Music(musicTitle, songArtist,  musicData);
        this.leaderboard = leaderboard; // array of 10 * {username: str, score: int}
    }

    save() {
        let musicID = this.musicObj.save();
        let beatmapList = getBMListFromFile(FILE_PATH);
        beatmapList.push({
            noteList: this.noteList,
            difficulty: this.difficulty,
            creator: this.creator,
            leaderboard: this.leaderboard,
            musicID: musicID,
        });
        saveBMListToFile(FILE_PATH, beatmapList);
    }

    static getList(){
        return getBMListFromFile(FILE_PATH);
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