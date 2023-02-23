const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const ENV = require('../config');

let users = [];

const isValid = (username, callback)=>{ //returns boolean, we will return a callback, since we are returning a specific error
//write code to check is the username is valid
  if(!username) callback("Username cannot be empty")
  if(username.includes(" ") ) callback("Invalid Username")
  if(username.length < 4) callback("Username must be 4 or more letters")
  var alreadyExist = users.find(c => c.username === username)
  if(alreadyExist) callback("Username already exist")

  // if all is well
  callback(null, true)

}

const authenticatedUser = (username,password)=>{ //returns boolean
  let user = users.find(c => c.username === username)
  if(user){
    if(user.password == password){
      return true;
    }
  }

  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body
  if(authenticatedUser(username, password)){
    const token = jwt.sign({username: username}, ENV.JWT_SECRET , { expiresIn : "24h"});
    req.session.token = token
    return res.status(200).send("Customer successfully logged in");
  }
  return res.status(422).json({error: "Invalid username or password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const review = req.query.review
  // get the book
  var book = books[isbn];

  if(!book) return res.status(404).json({message: "Book not found"});

  // get book review
  var reviews = book.reviews
  
  // get logged in user
  var user = req.user.username
  var isUser = users.find(u => u.username === user);
  if(!isUser){
    return res.status(401).send("Invalid authentication");
  }

  // add or update review
  reviews[user] = review;
  
  return res.status(200).json(`The review for the book with ISBN ${isbn} has been added/updated`);

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn

  // get the book
  var book = books[isbn];

  if(!book) return res.status(404).json({message: "Book not found"});

  // get book review
  var reviews = book.reviews
  // get logged in user
  var user = req.user.username
  var isUser = users.find(u => u.username === user);
  if(!isUser){
    return res.status(401).send("Invalid authentication");
  }
  // delete reviews reviews
  if(reviews[user]){
    delete reviews[user]
    return res.status(200).send(`Review for book with ISBN ${isbn} deleted successfully`)
  }
  return res.status(401).send("You have not write a review for this book")

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
