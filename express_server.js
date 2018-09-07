"use strict"

const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
    'b2xVn2': 'https://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com',
    'U7gSzm': 'http://www.twitter.com'
};


// body parser for the POST route for the delete button
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
// Used Matt's code...he said he got the base of it from the top response by csharptest https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript 
function generateRandomString(digits) {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var text = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 
    for (var i = 0; i < digits; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
 
    return text;
 }

app.get('/urls.json', (req, res) => {
    res.send(urlDatabase);
});

// list all the URLs (shortened, with delete links)
app.get('/urls', (req, res) => {
    const templateVars = { urls: urlDatabase, title: 'TinyApp' };
    res.render('urls_index', templateVars);
});

// show the user the form to create a new short url
app.get('/urls/new', (req, res) => {
    const templateVars = { };
    res.render('urls_new', templateVars);
});

// get shortURL NEEDS MORE
app.get('/urls/:id', (req, res) => {
    const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render('urls_show', templateVars);
});

// public-facing link that turns magically into the full longURL
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL];
    res.redirect(longURL);
})

// Actually does the URL-shortening:
//   * generates a random url
//   * adds or appends shortURL into the database
//   * sends them somewhere.  where?  drat!
app.post('/urls', (req, res) => {
    let shortURL = generateRandomString(6) 
    console.log(shortURL);
    console.log(req.body.longURL);
    urlDatabase[shortURL] = req.body.longURL
    console.log(urlDatabase);
    // TODO: we're ghosting on the user's browser.  stop ghosting, tell them where to go next.
});

// route to /urls after updating short url
app.post('/urls/:id', (req, res) => {
    urlDatabase[req.params.id] = req.body.longURL
    res.redirect('/urls');
});

// parameters sent with 
app.post('/urls/:id/delete', function(req, res) {
    let urlId = req.params.id;
    console.log(urlId);
    delete urlDatabase[urlId];
    console.log(urlDatabase);
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`TinyApp listening on port ${PORT}!`);
});


console.log("the bottom");