const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const dns = require("dns");

const { Schema } = mongoose;

const cors = require("cors");

const app = express();

require("dotenv").config();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once("open", () => {
  console.log("connected");
});
db.on("error", console.error.bind(console, "connection error:"));

app.use(cors());

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  original_url: {
    type: String,
    required: true,
    unique: true,
    default: "https://www.google.com"
  },
  short_url: { type: Number, required: true, unique: true, default: 0 }
});

const UrlList = mongoose.model("UrlList", urlSchema);

app.post("/api/shorturl/new", (req, res) => {
  const protocol = /^https?:\/\//i;
  let counter = 0;

  if (!protocol.test(req.body.url)) return res.json({ error: "invalid URL" });

  const myUrl = new URL(req.body.url);

  return dns.lookup(myUrl.host, err => {
    if (err) res.send("please provide a valid URL");
    UrlList.countDocuments({})
      .then(count => {
        counter = count;
      })
      .then(() => {
        const list = new UrlList({
          original_url: myUrl.host,
          short_url: counter + 1
        });
        list
          .save()
          .then(data => {
            res.json({
              original_url: data.original_url,
              short_url: data.short_url
            });
          })
          .catch(error => {
            res.json(error);
          });
      });
  });
});

app.get("/api/shorturl/:id(\\d+)/", (req, res) => {
  UrlList.find({ short_url: req.params.id }, (err, data) => {
    res.redirect(`http://${data[0].original_url}`);
  });
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});
