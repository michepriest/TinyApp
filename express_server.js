'use strict'
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000 // === 24 hours in milliseconds
}));

// URL and userDb
const PORT = 8080;
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
// Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString(digits) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i <= digits; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/urls.json', (request, response) => {
  response.send(urlDatabase);
});

// list all the URLs (shortened, with delete links)
app.get('/urls', (request, response) => {
  let email = request.session.user_id;
  let templateVars = { urls: urlDatabase, title: 'TinyApp', email: email};
  response.render('urls_index', templateVars);
});

// show the user the form to create a new short url
app.get('/urls/new', (request, response) => {
  let email = request.session.user_id;
  let templateVars = { email: email };
  response.render('urls_new', templateVars);
});

// display shortURL and longURL
app.get('/urls/:id', (request, response) => {  
  console.log(request.params)
  let email = request.session.user_id;
  let templateVars = { shortURL: request.params.id, longURL: urlDatabase[request.params.id], email: email };
  response.render('urls_show', templateVars);
});

// Creates a registration page
app.get('/register', (request, response) => {
  let templateVars = { title: "Register"}
  response.render('register', templateVars);
});

// login page
app.get('/login', (request, response) => {
  let templateVars = { title: 'Login'}
  response.render('login', templateVars);
});

// public-facing link that turns magically into the full longURL
app.get('/u/:shortURL', (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  response.redirect(longURL);
});

// 
app.get('/logout', (request, response) => {
  response.clearCookie('session');
  response.redirect('/urls');
});

// registration
app.post('/register', (request, response) => {

  let email = request.body.email;
  let password = request.body.password;
  let userId = generateRandomString(6);
  userDb[userId] = {id: userId, email: email, password: password};
  request.session.user_id = userId;
  response.redirect('/urls');
});

// validate login
app.post('/login', (request, response) => {
  // verify user_id === userDb, if true, next step | if false, send error
  let email = request.body.email;
  for (let key in userDb) {
    if (userDb[key].email === email) {
      // verify correct password, if true, next step | if false, send error
      if (userDb[key].password === request.body.password) {
        // set user_id cookie on successfull login
        request.session.user_id = email
        response.redirect('/urls');
        return;
      }
    }
  }
  response.redirect(400, '/login');
});

// Actually does the URL-shortening:
//   * generates a random url
//   * adds or appends shortURL into the database
//   * sends them somewhere.  where?  drat!
app.post('/urls', (request, response) => {
  let shortURL = generateRandomString(6); 
  // console.log(shortURL);
  console.log(request.body.longURL);
  urlDatabase[shortURL] = request.body.longURL;
  // console.log(urlDatabase);
  // TODO: we're ghosting on the user's browser.  stop ghosting, tell them where to go next.
  response.redirect('/urls');
});

// route to /urls after updating short url
app.post('/urls/:id', (request, response) => {
  console.log(request.body.longURL);
  urlDatabase[request.params.id] = request.body.longURL;
  console.log(urlDatabase);
  response.redirect('/urls');
});

// parameters sent with 
app.post('/urls/:id/delete', function(request, response) {
  let urlId = request.params.id;
  // console.log(urlId);
  delete urlDatabase[urlId];
  // console.log(urlDatabase);
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
