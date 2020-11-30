var express = require("express");
var router = express.Router();
var Beatmap = require("../model/Beatmap.js");

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

//POST a new beatmap
router.post("/", function(req, res, next){
    let beatmap = new Beatmap(req.params.noteList, req.params.difficulty, req.params.musicTitle, 
        req.params.musicData, req.params.songArtist, req.params.bmCreator, req.params.leaderboard);
    let beatmapID = beatmap.save();
    return res.json({beatmapID: beatmapID});
});

module.exports = router;