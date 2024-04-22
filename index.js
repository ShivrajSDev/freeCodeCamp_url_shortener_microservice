require('dotenv').config();
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let shortenedURL;

let shortenedUrlSchema = mongoose.Schema({
  original_url: {
    type: String,
    unique: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }
});

shortenedURL = mongoose.model('ShortenedURL', shortenedUrlSchema);

const findExisting = function(req, res, next) { 
  shortenedURL.findOne({"original_url": req.body.url}).exec(function(err, result) {
    if(err) {
      res.json({error: err});
    } else {
      if(result) {
        res.json({
          original_url: result.original_url,
          short_url: result.short_url
        });
      } else {
        next();
      }
    }
  }); 
}

const addNewRecord = function(req, res) {
  shortenedURL.find().sort({short_url: -1}).limit(1).exec(function(err, data) {
    if(err) {
      res.json({error: err});
    } else {
      let newShortenedUrl = shortenedURL({
        original_url: req.body.url,
        short_url: data.length > 0 ? data[0].short_url + 1 : 1
      });

      newShortenedUrl.save(function(err, data) {
        if(err) {
          res.json({error: err});
        } else {
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          });
        }
      });
    }
  });
}

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', function(req, res) {
  shortenedURL.findOne({"short_url": req.params.id}, function(err, result) {
    if(err) {
      res.json({error: err});
    } else {
      if(result) {
        res.writeHead(301, {
          Location: result.original_url
        }).end();
      } else {
        res.json({error: "No short URL found for the given input"});
      }
    }
  });
});

app.post('/api/shorturl', function(req, res, next) {
  const urlRegex = new RegExp('^https?:\/\/');

  if(urlRegex.exec(req.body.url)){
    let urlObject = new URL(req.body.url);
    console.log(req.body.url);

    dns.lookup(urlObject.hostname, (err) => {
      if(err) {
        res.json({error: "Invalid URL"});
      } else {
        next();
      }
    });
  } else {
    res.json({error: "Invalid URL"});
  }
}, findExisting, addNewRecord);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
