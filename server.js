const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const dns = require("dns");

const { Schema } = mongoose;

const cors = require("cors");

const app = express();

require("dotenv").config();

// Basic Configuration
const port = process.env.PORT || 3000;

/** this project needs a db !! * */

mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies * */
// you should mount the body-parser here

const bodyParser = require("body-parser");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// your first API endpoint...
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// creacte Schema

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

const urlList = mongoose.model("urlList", urlSchema);

app.post("/api/shorturl/new", (req, res) => {
  const protocol = /^https?:\/\//i;

  if (!protocol.test(req.body.url)) return res.json({ error: "invalid URL" });

  const myUrl = new URL(req.body.url);

  dns.lookup(myUrl.host, err => {
    if (err) return res.json({ error: "invalid URL" });
    return res.json(myUrl.host);
  });
});

app.get("/api/shorturl/:id(\\d+)/", (req, res) => {
  console.log(req.params);
  res.send(req.params.id);
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});
