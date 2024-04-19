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

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', function(req, res) {
    res.json({test: "get"});
});

app.post('/api/shorturl', function(req, res, next) {
  const urlRegex = new RegExp('^https?:\/\/');

  if(urlRegex.exec(req.body.url)){
    let urlObject = new URL(req.body.url);

    dns.lookup(urlObject.hostname, (err) => {
      if(err) {
        res.json({error: "Invalid URL"});
      } else {
        req.fullUrl = req.body.url;
        next();
      }
    });
  } else {
    res.json({error: "Invalid URL"});
  }
}, function (req, res) {
  shortenedURL.findOne({"original_url": req.fullUrl})
    .exec(function(err, data) {
      if(err) {
        res.json({error: err});
      } else {
        console.log(data);
        if(data) {
          //res.json({post: "result"});
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          });
        } else {
          let counter;
          shortenedURL.count()
            .exec(function(err, data) {
              if(err) {
                res.json({error: err});
            } else {
              counter = data + 1;
              let newShortenedUrl = shortenedURL({
                original_url: req.fullUrl,
                short_url: counter
              });
              newShortenedUrl.save(function(err, data) {
                if(err) {
                  res.json({error: err});
                } else {
                  console.log(data);
                  res.json({
                    original_url: data.original_url,
                    short_url: data.short_url
                  });
                }
              })
            }
          });
        }
      }
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
