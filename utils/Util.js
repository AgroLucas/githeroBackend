//created this module so that User.js doesn't require Beatmap.js -> no circular dependency
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