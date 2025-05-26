require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = {};
let urlCount = 1;

// POST endpoint for URL shortening
app.post('/api/shorturl', (req, res) => {
  let original_url = req.body.url;
  try {
    let urlObj = new URL(original_url);
    console.log(urlObj);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        let short_url = urlCount++;
        urlDatabase[short_url] = original_url;
        res.json({ original_url, short_url });
      }
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint for redirecting
app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = req.params.short_url;
  let original_url = urlDatabase[short_url];
  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
