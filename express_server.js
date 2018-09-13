'use strict'

const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

// Dependencies
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000 // === 24 hours in milliseconds
}));

// URL and userDb
const urlDatabase = {
  'b2xVn2': 'https://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'U7gSzm': 'http://www.twitter.com'
};
// TROUBLESHOOTING ABOVE IS OKAY

const userDb = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'user3@example.com',
    password: 'lighthouse'
  }
};

// Used Matt's code...he said he got the base of it from the top response by csharptest https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript 
function generateRandomString(digits) {
  //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i <= digits; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});

// list all the URLs (shortened, with delete links)
app.get('/urls', (req, res) => {
// TROUBLESHOOTING: THE ABOVE IS OKAY  
  let user_id = req.session.user_id; 
  // ABOVE NEEDS TROUBLESHOOTING 000000000000000000
  let templateVars = { urls: urlDatabase, title: 'TinyApp', user: user_id }; // TODO: MAKE DYNAMIC!!!
  // TROUBLESHOOTING: let templateVars = { urls: urlDatabase IS OKAY 000000000000
  res.render('urls_index', templateVars);
  // TROUBLESHOOTING: THE ABOVE IS OKAY
});

// show the user the form to create a new short url
app.get('/urls/new', (req, res) => {
// TROUBLESHOOTING: THE ABOVE IS OKAY  
  let user_id = req.session.user_id;
// ?????????????????????????????????????????????????????????????????
  let templateVars = { user: user_id };
  res.render('urls_new', templateVars);
  // TROUBLESHOOTING: res.render('urls_new' IS OKAY
});

// get shortURL NEEDS MORE
app.get('/urls/:id', (req, res) => {
// TROUBLESHOOTING: THE ABOVE IS OKAY  
  let user_id = req.session.user_id;
  // ABOVE NEEDS TROUBLESHOOTING 000000000000000000
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: user_id };
  // TROUBLESHOOTING: let templateVars = { shortURL: req.params.id, IS OKAY 0000000000
  res.render('urls_show', templateVars);
});

// Creates a registration page
app.get('/register', (req, res) => {
  let templateVars = { title: "Register"}
  //let user_id = req.body.user_id;
  //let password = req.body.password;
  res.render('register', templateVars);
});
// ?????????????????????????????????????????????????????????????????

// login page
app.get('/login', (req, res) => {
  let templateVars = { title: 'Login'}
  let user_id = req.body.user_id;
  let password = req.body.password;
  res.render('login', templateVars);
});
// ?????????????????????????????????????????????????????????????????

// public-facing link that turns magically into the full longURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
// TROUBLESHOOTING: THE ABOVE IS OKAY 

// registration
app.post('/register', (req, res) => {
  let user_id = req.body.email;
  let password = req.body.password;
  let userId = generateRandomString(6);
  userDb[userId] = {id: userId, user: user_id, password: password};
  // console.log(user, password);
  // res.cookie(username, req.body.username);
  req.session.user_id = userId;
  res.redirect('/urls');
});
// ?????????????????????????????????????????????????????????????????

// Login
app.post('/login', (req, res) => {
  let user_id = req.body.email;
  let password = req.body.password;
  let userId = generateRandomString(6);
  userDb[userId] = {id: userId, user: user_id, password: password};
  console.log(user_id, password);
  // res.cookie(username, req.body.username);
  req.session('user_id', user_id);
  req.session('user_id', userId);
  res.redirect('/urls');
});
// let user_id = req.body.user_id;
// req.session(user_id, req.body.user_id);
// The above two lines may or may not be needed.

// TROUBLESHOOTING ABOVE D2D3 COOKIES IN EXPRESS TASK 3

// the login form is in the _header partial
app.post('/logout', (req, res) => {
  let user_id = req.body.user_id;
  res.clearCookie(user_id, req.body.user_id);
  res.redirect('/urls');
});

// Actually does the URL-shortening:
//   * generates a random url
//   * adds or appends shortURL into the database
//   * sends them somewhere.  where?  drat!
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(6); 
  // console.log(shortURL);
  console.log(req.body.longURL);
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  // TODO: we're ghosting on the user's browser.  stop ghosting, tell them where to go next.
});
// TROUBLESHOOTING: ABOVE SHOULD BE OKAY, BUT NOT SURE 0000000000000000000

// route to /urls after updating short url
app.post('/urls/:id', (req, res) => {
  console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});
// TROUBLESHOOTING: THE ABOVE IS OKAY 

// parameters sent with 
app.post('/urls/:id/delete', function(req, res) {
  let urlId = req.params.id;
  // console.log(urlId);
  delete urlDatabase[urlId];
  // console.log(urlDatabase);
  res.redirect('/urls');
});
// TROUBLESHOOTING: THE ABOVE IS OKAY 

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// console.log("the bottom");