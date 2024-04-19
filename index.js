require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
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
        req.originalurl = req.body.url;
        next();
      }
    });
  } else {
    res.json({error: "Invalid URL"});
  }
}, function (req, res) {
  res.json({
    original_url: req.originalurl,
    short_url: 1
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
