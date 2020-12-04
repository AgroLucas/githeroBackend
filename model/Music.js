"strict mode";
const FILE_PATH = __dirname + "/musics.json";
class Music {
    constructor (title, artist, musicData) {
        console.log("enter new Music");
        this.title = title;
        this.artist = artist;
        this.musicData = musicData //base 64
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
        });
        saveMusicListToFile(FILE_PATH, musicList);
        return musicID;
    }

    static isMusic(musicID){
        if(musicID < 0) return false;
        let musicList = getMusicListFromFile(FILE_PATH);
        return musicID < musicList.length;
    }

    static getMusicFromList(musicID){
        let musicList = getMusicListFromFile(FILE_PATH);
        if(musicID < 0 || musicID > musicList.length){
            return;
        }
        return musicList[musicID];
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