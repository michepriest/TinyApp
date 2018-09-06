"use strict"

const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
    "U7gSzm": "http://www.twitter.com"
};
// body parser for the POST route for the delete button
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
// Used Matt's code...he said he got the base of it from the top response by csharptest https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript 
function generateRandomString(digits) {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 
    for (var i = 0; i < digits; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
 
    return text;
 }

app.get("/urls.json", (req, res) => {
    res.send(urlDatabase);
});
// creates title
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, title: "TinyApp" };
    res.render("urls_index", templateVars);
});
// get urls_new
app.get("/urls/new", (req, res) => {
    const templateVars = { urlsNew: req.params.id };
    res.render("urls_new", templateVars);
});
// get shortURL
app.get("/urls/:short", (req, res) => {
    const templateVars = { shortURL: req.params.id };
    res.render("urls_show", templateVars);
});
// 
// 
app.post('/urls', function(req, res) {
    var key = generateRandomString(6) 
    console.log(key);
    console.log(req.body.longURL);
});
// POST http://localhost:8080/api/users
// parameters sent with 
app.post('/urls/:id/delete', function(req, res) {
    let urls = req.params.id;
    console.log(urls);
    delete urlDatabase[urls];
    console.log(urlDatabase);
    res.redirect("/urls");
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});