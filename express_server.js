'use strict'
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000 // === 24 hours in milliseconds
}));

const PORT = 8080;
const urlDatabase = {
  'b2xVn2': {
    shortURL: 'b2xVn2',
    longURL: 'https://www.lighthouselabs.ca',
    userID: 'userRandomID',
  },
  '9sm5xK': {
    shortURL: '9sm5xK',
    longURL: 'http://www.google.com',
    userID: 'user3RandomID',
  },
  'U7gSzm': {
    shortURL: 'U7gSzm',
    longURL: 'http://www.twitter.com',
    userID: 'user3RandomID',
  },
};

const userDb = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10)
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'user3@example.com',
    password: bcrypt.hashSync('lighthouse', 10)
  }
};

function getUrlsForUser(userID){
  var result = [];
  for(var key in urlDatabase){
    if(urlDatabase[key].userID === userID){
      result.push(urlDatabase[key]);
    }
  }
  return result;
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

function findUserByEmail(email) {
  for (let userID in userDb) {
    let user = userDb[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.get('/urls.json', (request, response) => {
  response.send(urlDatabase);
});

// list all the URLs (shortened, with delete links)
app.get('/urls', (request, response) => {
  let userID = request.session.user_id; // "abcdef"
  let user = userDb[userID]             // { id: "abcdef", email: "asd@asd", password: "ghjghgj" }
  let templateVars = { urls: getUrlsForUser(userID), title: 'TinyApp', user: user };
  let usersURLs = getUrlsForUser(userID);
  if (userID) {
    templateVars = {usersURLs: usersURLs, title: 'TinyApp', user: user}
  } else {
    reponse.send('No access')
  }
  response.render('urls_index', templateVars);
});

// show the user the form to create a new short url
app.get('/urls/new', (request, response) => {
  let userID = request.session.user_id;
  let user = userDb[userID];
  let templateVars = { user: user };
  if (!userID) {
    response.send("Request denied. Please ensure you are logged in.")
  } else {
    response.render('urls_new', templateVars);
  }
});

// display shortURL and longURL
app.get('/urls/:id', (request, response) => {  
  let userID = request.session.user_id;
  let user = userDb[userID];
  let templateVars = { 
    shortURL: request.params.id, 
    longURL: urlDatabase[request.params.id].longURL, 
    user: user,
  };
  if (!userID) {
    response.send("Request denied. Please ensure you are logged in.")
  } else {
    response.render('urls_show', templateVars);
  }
});

// creates a registration page
app.get('/register', (request, response) => {
  let templateVars = { title: "Register"}
  response.render('register', templateVars);
});

// login page
app.get('/login', (request, response) => {
  let templateVars = { title: 'Login'}
  response.render('login', templateVars);
});

// when click on shortURL will be sent to destination of long URL
app.get('/u/:shortURL', (request, response) => {
  let shortURL = request.params.shortURL;
  console.log(urlDatabase)
  console.log(shortURL)
  let longURL = urlDatabase[shortURL].longURL;
  response.redirect(longURL);
});

app.get('/logout', (request, response) => {
  response.clearCookie('session');
  response.redirect('/urls');
});

// registration
app.post('/register', (request, response) => {

/// NOTE TODO!!!!!: need to check if user exists, use function findUserByEmail

  let email = request.body.email;
  let userId = generateRandomString(6);
  let password = request.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  userDb[userId] = {id: userId, email: email, password: hashedPassword};
  request.session.user_id = userId;
  response.redirect('/urls');
});

// validate login
app.post('/login', (request, response) => {
  // verify user_id === userDb, if true, next step | if false, send error
  let email = request.body.email;
  let password = request.body.password;
  let user = findUserByEmail(email);
  
  if (user) {
    // verify correct password, if true, next step | if false, send error
    console.log("User verified")
    
    let hashedPassword = user.password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      console.log("Password verified");
      // set user_id cookie on successfull login
      request.session.user_id = user.id;
      response.redirect('/urls');
      //return;
    }
  } else {
    response.status(400).send("Please check for your username / password");
  }
  
});

//   * generates a short, random url
//   * adds or appends shortURL into the database
app.post('/urls', (request, response) => {
  let shortURL = generateRandomString(6); 
  let urlId = request.params.id;
  if (!request.session.user_id) {
    response.send("Request denied. Please ensure you are logged in.")
  } else {
    urlDatabase[shortURL] = {
      shortURL: shortURL,
      longURL: request.body.longURL,
      userID: request.session.user_id
    }
    console.log("added a new shorturl to the database, new state is")
    console.log(urlDatabase)
    response.redirect('/urls');
  }
});

// route to /urls after updating short url
app.post('/urls/:id', (request, response) => {
  let urlId = request.params.id;
  if (!request.session.user_id) {
    response.send("Request denied. Please ensure you are logged in.")
  } else {
    console.log("HHHEEEEYYYY!!!!!")
    urlDatabase[request.params.id].longURL = request.body.longURL;
    response.redirect('/urls');
  }
});

// delete only available if logged in
app.post('/urls/:id/delete', (request, response) => {
  if (!request.session.user_id){
    response.send("Request denied. Please ensure you are logged in.")
  } else {
    delete urlDatabase[request.params.id];
    response.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
