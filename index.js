require('dotenv').config();
let mongoose = require('mongoose');

const uri = process.env.MONGODB_URI
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((() => {
    console.log('Connection successful');
  })).catch((e) => {
    console.log('Connetion failed');
    console.error(e);
  });

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let shortURL;

let shortUrlSchema = mongoose.Schema({
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

shortURL = mongoose.model('ShortURL', shortUrlSchema);

// Checks to see if an existing entry exists for the given URL.
// If so, return the entry's details.
// Otherwise, proceed to save a new entry in the database.
const findExistingEntry = function(req, res, next) { 
  shortURL.findOne({"original_url": req.body.url}).exec(function(err, result) {
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

// Saves a new entry in the database and returns that entry's details
// to the user if it was saved successfully.
const addNewEntry = function(req, res) {
  shortURL.find().sort({short_url: -1}).limit(1).exec(function(err, data) {
    if(err) {
      res.json({error: err});
    } else {
      let newShortUrl = shortURL({
        original_url: req.body.url,
        short_url: data.length > 0 ? data[0].short_url + 1 : 1
      });

      newShortUrl.save(function(err, data) {
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

// GET API method to retrieve an existing entry from the database based on a
// given id.
// If found, redirect to the saved entry's URL.
// Otherwise, notify user that no such entry exists.
app.get('/api/shorturl/:id', function(req, res) {
  shortURL.findOne({"short_url": req.params.id}).exec(function(err, result) {
    if(err) {
      res.json({error: err});
    } else {
      console.log(req.params.id);
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

// POST API method to save the specified URL in the database, or otherwise retrieve its details
// if it was saved previously.
// The first step of the process involves first validating the URL's hostname using dns.lookup.
// The provided URL must also follow the valid HTTP format (e.g. http://www.example.com).
app.post('/api/shorturl', function(req, res, next) {
  const urlRegex = new RegExp('^https?:\/\/');
  if(urlRegex.exec(req.body.url)){
    let urlObject = new URL(req.body.url);

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
}, findExistingEntry, addNewEntry);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
