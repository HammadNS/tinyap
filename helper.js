//if the email is associated with any user in the data
function getUserByEmail(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
}

// GENERATES A RANDOM STRING FOR A NEW USER AND COOKIE
function generateRandomString() {
  let output = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz1234567890";
  for (let i = 0; i < 5; i++) {
    let random = Math.floor((Math.random() * 25) + 97);
    output += String.fromCharCode(random)
  }
  return output
};

// FILTERS OUT ALL URLS OWNED BY 'id'
function urlsForUser(id, urlData) {
  let userUrls = {};
  for (url in urlData) {
    if (urlData[url].userID === id) {
      userUrls[url] = urlData[url];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser }