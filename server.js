require("./utils/prod-util/checkEnv")();

// packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");

// .CONFIG
// server
const SelfConfig = require("./config/self");

// database
const DbCongig = require("./config/database");

// init app
const app = express();

// .MIDDLEWARES
// cors
app.use(cors());

//parse json
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// helmet
app.use(helmet());

// for parsing multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

app.use(upload.any());

// set staic folder
app.use(express.static(path.join(__dirname, "public")));

// .DATABASE
//database connection
mongoose.connect(DbCongig.uri, DbCongig.options);

let db = mongoose.connection;

//check connection
db.once("open", () => {
  console.log("connection success DB...");
});

//check for db console.error();
db.on("error", (err) => {
  console.log(err);
});

// port config
const PORT = process.env.PORT || 5000;

// server
const server = app.listen(PORT, () =>
  console.log(`Server started at port ${PORT}`)
);

// .ROUTES
// import routes
const auth = require(`./routes/${SelfConfig.API_LEVEL}/auth`);
const user = require(`./routes/${SelfConfig.API_LEVEL}/user`);
const article = require(`./routes/${SelfConfig.API_LEVEL}/article`);
const comment = require(`./routes/${SelfConfig.API_LEVEL}/comment`);
const topics = require(`./routes/${SelfConfig.API_LEVEL}/topics`);
const admin = require(`./routes/${SelfConfig.API_LEVEL}/admin`);

// mount routes
app.use(`/${SelfConfig.API_LEVEL}/auth`, auth);
app.use(`/${SelfConfig.API_LEVEL}/user`, user);
app.use(`/${SelfConfig.API_LEVEL}/article`, article);
app.use(`/${SelfConfig.API_LEVEL}/comment`, comment);
app.use(`/${SelfConfig.API_LEVEL}/topics`, topics);
app.use(`/${SelfConfig.API_LEVEL}/admin`, admin);

app.get("/", (_, res) => {
  res.send(
    "<center><h1></br>Hello from Inkpod. But you should not be here :(</h1></center>"
  );
});

// 404 route
app.get("*", (_, res) => {
  res.status(404).json({
    success: false,
    message: "The route you are requesting is not hosted on this server",
  });
});

// display routes in the console for all the mounted routes
if (process.env.PRINT_ROUTES) require("./utils/dev-util/displayRoutes")(app);
