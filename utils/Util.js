function getBMListFromFile() {
    let filePath = __dirname + "/../model/beatmaps.json";
    const fs = require("fs");
    if (!fs.existsSync(filePath)) return [];
    let bmListRawData = fs.readFileSync(filePath);
    let bmList;
    if (bmListRawData) bmList = JSON.parse(bmListRawData);
    else bmList = [];
    return bmList;
}

function getActive(beatmapID) {
    //liste de beatmap avec leur attributs
    let liste = getBMListFromFile();
    let isActive = true;
    liste.every(element => {
        if (element.beatmapID == beatmapID) {
            isActive = element.isActive;
            return false;
        }
        return true;
    });
    return isActive;
}



module.exports = { getActive }