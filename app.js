let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
//let helmet = require('helmet');

let usersRouter = require("./routes/users");
let beatmapRouter = require("./routes/beatmaps");

let app = express();

//app.use(helmet());
app.use(logger("dev"));
app.use(express.json({limit: "15mb"}));
app.use(express.urlencoded({ 
  limit: "15mb",
  extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public"))); //envoye static files to client
app.use((req,res,next)=>{ //  su uri est pas trouve alors renvoie un fichier static puis index.html essetienl
  if(!req.path.startsWith("/api/"))
  return res.sendFile(`${__dirname}/public/index.html`);
  next();
});

app.use("/api/users", usersRouter);
app.use("/api/beatmaps", beatmapRouter);



module.exports = app;
