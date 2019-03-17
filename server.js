const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const dns = require("dns");

const { Schema } = mongoose;

const cors = require("cors");

const app = express();

require("dotenv").config();

// Basic Configuration
const port = process.env.PORT || 3000;

/** this project needs a db !! * */

mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true
});

mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once("open", function() {
  console.log("connected");
});
db.on("error", console.error.bind(console, "connection error:"));

app.use(cors());

/** this project needs to parse POST bodies * */
// you should mount the body-parser here

const bodyParser = require("body-parser");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
  console.log(mongoose.connection.readyState);
});

// your first API endpoint...
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// creacte Schema

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
    unique: true,
    default: "https://www.freecodecamp.com"
  },
  short_url: { type: Number, required: true, unique: true, default: 0 }
});

const UrlList = mongoose.model("UrlList", urlSchema);

app.post("/api/shorturl/new", (req, res, next) => {
  const protocol = /^https?:\/\//i;

  if (!protocol.test(req.body.url)) return res.json({ error: "invalid URL" });

  const myUrl = new URL(req.body.url);

  const list = new UrlList({
    original_url: myUrl.host,
    short_url: 4
  });

  list
    .save()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json(err);
    });
});

// app.get("/api/shorturl/:id(\\d+)/", (req, res) => {
//   console.log(req.params);
//   res.send(req.params.id);
// });

app.listen(port, () => {
  console.log("Node.js listening ...");
});
