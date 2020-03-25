// all of the npm installs
const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { getUserByEmail } = require('./helper');
const { generateRandomString } = require('./helper');
const { urlsForUser } = require('./helper');



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
}));

// use method overide
app.use(methodOverride('_method'));


// All the users that exist in the databse
const users = {
};

// Database for all urls
const urlDatabase = {
};

///////////////////// GET ROUTES//////////////////////
// homepage
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
});


// get request to register user
app.get('/register', (req, res) => { // POP UP THE FORM
  let templateVars = { user_id: req.session.user_id, users: users };
  res.render('registration.ejs', templateVars);
})


// get request for logging into account
app.get('/login', (req, res) => {  // POPS UP FORM
  let templateVars = { user_id: req.session.user_id, users: users };
  res.render('login.ejs', templateVars);
});


// get request to post urls
app.get('/urls', (req, res) => { // VIEWS
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { user_id: req.session.user_id, urls: userURLs, users: users };
  res.render('urls_index', templateVars);
});

// get request to get new URL
app.get('/urls/new', (req, res) => {  // POPS UP THE FORM
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = { user_id: req.session.user_id, users: users };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user_id: req.session.user_id, shortURL: req.params.shortURL, users: users, longURL: undefined, owner: false, urls: urlsForUser(req.session.user_id, urlDatabase) }
  if (urlDatabase[req.params.shortURL]) {
    templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      templateVars.owner = true;
    }
  }
  res.render('urls_show', templateVars);
});


// directs to the longUrl using the shortUrl
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    urlDatabase[req.params.shortURL].visitors += 1;
    res.redirect(longURL);
  } else {
    res.statusCode = 400;
    res.send("404 Not Found.")
  }
});

//////////////// POST ROUTES////////////////////////////////////////////////
app.post('/register', (req, res) => {
  const email = req.body.emailAddress;
  const password = bcrypt.hashSync(req.body.pwd, 10);
  if (email === "" || req.body.pwd === "") {
    res.statusCode = 400;
    res.send('ERROR 400: Please fill out email and password')
  } else if (getUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send('ERROR 400: Email already exist!');
  } else {
    const randomID = generateRandomString();
    users[randomID] = { id: randomID, email: email, password: password };
    req.session.user_id = randomID;
  }
  res.redirect('/urls');
});


app.post('/login', (req, res) => { // ONCE FORM HAS BEEN FILLED IN 
  const lookupEmailResult = getUserByEmail(req.body.emailAddress, users);
  if (lookupEmailResult) {
    if (bcrypt.compareSync(req.body.pwd, users[lookupEmailResult].password)) {
      req.session.user_id = users[lookupEmailResult].id;
      res.redirect('/urls')
    } else {
      res.statusCode = 403;
      res.send("ERROR 403: Password does not match email");
    }
  } else {
    res.statusCode = 403;
    res.send("ERROR 403: Email does not exist!")
  }
});


// GET AND POST OF URLS (CREATES A NEW SHORTURL AND VIEW ALL SHORTURLS)


app.post('/urls', (req, res) => { // CREATES
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id, visitors: 0 };
  res.redirect(`/urls/${shortURL}`);
});


// CREATES A NEW URL AND POSTS TO /URLS (ABOVE)


// LOG OUT OF ACCOUNT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
});



// EDITS THE LONGURL OF THE EXISTING SHORTURL
app.put('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  }
  res.redirect('/urls');
});



// DELETES A SHORTURL
app.delete('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
