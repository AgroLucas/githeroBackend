var express = require("express");
var router = express.Router();
var Beatmap = require("../model/Beatmap.js");
const User = require("../model/User.js");
let { authorize } = require("../utils/auth");


// GET beatmap LIST
router.get("/list/:username", function(req, res) {
    return res.json(Beatmap.getList(req.params.username));
}); 

// GET one beatmap & its song
router.get("/:beatmapID", function(req, res) {
    let beatmapID = req.params.beatmapID;
    if(Beatmap.isBeatmap(beatmapID)){
        return res.json(Beatmap.getBeatmapFromList(beatmapID));
    }else {
        return res.status(404).send("ressource not found");
    }
    
});

//POST a new beatmap -> return beatmapID
router.post("/", authorize, function(req, res){
    let beatmap = new Beatmap(req.body.noteList, req.body.difficulty, req.body.musicTitle, 
        req.body.musicData, req.body.musicArtist, req.body.musicDuration, req.body.bmCreator);
    let beatmapID = beatmap.save();
    return res.json({beatmapID: beatmapID});
});

// PATCH the active attribute of a beatmap
router.patch("/setActive/:flag/:beatmapID", authorize, function(req, res){
    let flag = req.params.flag == "true" ? true : false; //convert string in bool
    if (User.isAdmin(req.body.username)) 
        Beatmap.setActive(req.params.beatmapID, flag);
    return res.json();
});

// UPDATE existing beatmap noteList
router.patch("/", authorize, function(req, res){
    let result = Beatmap.updateBeatmap(req.body.beatmapID, req.body.noteList, req.body.username);
    res.json({res: result});
});

module.exports = router;