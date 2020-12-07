"strict mode";
var Music = require("./Music.js");

const FILE_PATH = __dirname + "/beatmaps.json";
const DEFAULT_FILE_PATH = __dirname + "/defaultBeatmaps.json";
class Beatmap {
    constructor(noteList, difficulty, musicTitle, musicData, songArtist, musicDuration, bmCreator){
        this.noteList = noteList; // array of [noteType(int 0-1), lineNbr(int 0-3), startTime (int ms), endTime(int ms, optionnal)]
        this.creator = bmCreator;
        this.difficulty = difficulty; // String
        this.musicObj = new Music(musicTitle, songArtist,  musicData, musicDuration);
        this.leaderboard = []; // array of 10 * {username: str, score: int}
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

    //Return list of beatmap
    static getList(){
        let list = getBMListFromFile(DEFAULT_FILE_PATH).concat(getBMListFromFile(FILE_PATH)); //list = Default + Published beatmaps
        return list.map(item => {
            const data = Beatmap.getBeatmapFromList(item.beatmapID);
            return {
                beatmapID: data.beatmapID,
                musicTitle: data.musicTitle,
                musicArtist: data.musicArtist,
                musicDuration: data.musicDuration,
                creator: data.creator,
                difficulty: data.difficulty,
                leaderboard: data.leaderboard,
            }
        });
    }

    //returns if there is a beatmap & music stored that matches the beatmapID (+musicID inside beatmap)
    static isBeatmap(beatmapID) {
        console.log("isBeatmap");
        if(beatmapID < 0) { //neg ID -> default ?
            console.log("default");
            let defaultBeatmapList = getBMListFromFile(DEFAULT_FILE_PATH);
            //console.log("defaultBeatmapList: ", defaultBeatmapList);
            for(let i=0; i<defaultBeatmapList.length; i++){
                console.log(defaultBeatmapList[i].beatmapID, beatmapID);
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
        console.log("getBeatmapFromList");
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
            musicTitle: music.title,
            musicArtist: music.artist,
            musicData: music.data,
            musicDuration: music.duration,
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