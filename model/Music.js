"strict mode";
const FILE_PATH = __dirname + "/musics.json";
const DEFAULT_FILE_PATH = __dirname + "/defaultMusics.json";
class Music {
    constructor (title, artist, musicData, musicDuration) {
        console.log("title: ", title);
        console.log("artist: ", artist);
        console.log("duration: ", musicDuration);
        this.title = title;
        this.artist = artist;
        this.musicData = musicData //base 64
        this.duration = musicDuration;
    }

    // attributes and returns an id for the song (id = index in the array)
    save() {
        let musicList = getMusicListFromFile(FILE_PATH);
        let musicID = musicList.length;
        console.log("save music (id = " + musicID + ")");
        musicList.push({
            musicID: musicID,
            title: this.title,
            artist: this.artist,
            data: this.musicData,
            duration: this.duration,
        });
        saveMusicListToFile(FILE_PATH, musicList);
        return musicID;
    }

    static isMusic(musicID){
        console.log("isMusic");
        if(musicID < 0) { //default music ?
            let defaultMusicList = getMusicListFromFile(DEFAULT_FILE_PATH);
            for(let i=0; i<defaultMusicList.length; i++){
                if(defaultMusicList[i].musicID == musicID){
                    console.log("true");
                    return true;
                }
            }
            return false;
        } //music posted by user ?
        let musicList = getMusicListFromFile(FILE_PATH);
        return musicID < musicList.length;
    }

    static getMusicFromList(musicID){
        if(musicID >= 0){ //not in default musics
            let musicList = getMusicListFromFile(FILE_PATH);
            if(musicID > musicList.length){
                return;
            }
            return musicList[musicID];
        }else{  //in default musics ?
            let defaultMusicList = getMusicListFromFile(DEFAULT_FILE_PATH);
            for(let i=0; i<defaultMusicList.length; i++){
                if(defaultMusicList[i].musicID == musicID){
                    return defaultMusicList[i];
                }
            }
            return; //no music found in defult music list
        }
        
    }
}

function getMusicListFromFile(filePath) {
    const fs = require("fs");
    if (!fs.existsSync(filePath)) return [];
    let musicListRawData = fs.readFileSync(filePath);
    let musicList;
    if (musicListRawData) musicList = JSON.parse(musicListRawData);
    else musicList = [];
    return musicList;
}
  
function saveMusicListToFile(filePath, musicList) {
    const fs = require("fs");
    let data = JSON.stringify(musicList);
    fs.writeFileSync(filePath, data);
}

module.exports = Music;