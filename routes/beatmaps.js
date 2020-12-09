var express = require("express");
var router = express.Router();
var Beatmap = require("../model/Beatmap.js");
let { authorize } = require("../utils/auth");


// GET beatmap LIST
router.get("/", function(req, res, next) {
    return res.json(Beatmap.getList());
}); 

// GET one beatmap & its song
router.get("/:beatmapID", function(req, res, next) {
    let beatmapID = req.params.beatmapID;
    if(Beatmap.isBeatmap(beatmapID)){
        return res.json(Beatmap.getBeatmapFromList(beatmapID));
    }else {
        return res.status(404).send("ressource not found");
    }
    
});

//POST a new beatmap -> return beatmapID
router.post("/", authorize, function(req, res, next){
    let beatmap = new Beatmap(req.body.noteList, req.body.difficulty, req.body.musicTitle, 
        req.body.musicData, req.body.musicArtist, req.body.musicDuration, req.body.bmCreator);
    let beatmapID = beatmap.save();
    return res.json({beatmapID: beatmapID});
});

module.exports = router;