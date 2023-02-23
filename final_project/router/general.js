const { response } = require('express');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const {username, password} = req.body;
  isValid(username, (err, result)=>{
    if(err) return res.status(422).json({error : err})

    // validate password
    if(!password || password.includes(" ") || password.length < 6) return res.status(422).json({error : "Password be more than 6 letters, white spaces are not allowed"})

    let user = {username : username, password : password}
    users.push(user)

    res.status(200).json({message : "Registration successful, please login to your account"})
    //Write your code here
  })

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const getBooks = new Promise((resolve, reject)=>{
    resolve(books);
  })
  getBooks.then((resolve) => {
    return res.status(200).json({ books: resolve });
  }).catch((error) => {
    return res.status(500).send("Something went wrong")
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBook = new Promise((resolve, reject)=>{
    var book = books[isbn]
    if(!book) reject("Book not found")
    resolve(book)
  })

  getBook.then(function(resolve){
    return res.status(200).send(resolve);
  },
  function(reject){
    return res.status(404).send(reject);
  }).catch((err) => {
    return res.status(500).send("Something went wrong")
  })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooks = new Promise((resolve, reject) => {
    let result = [];
    var book_array = Object.entries(books)
    book_array.forEach((item, index) => {
        if (item[1].author == author) {
        var book = item[1];
          var book_obj = {
            isbn: index,
            title: book.title,
            reviews: book.reviews
          }
          result.push(book_obj)
        }
    })

    if(result.length == 0) reject("No records found");
    else resolve(result)
  })

  getBooks.then((resolve)=>{
    return res.status(200).json({books: resolve});
  }, (reject) => {
    return res.status(404).send(reject);
  }).catch((error) => {
    return res.status(500).send("Something went wrong")
  })
  return res.send(result);
 
  // if (result.length == 0) return res.status(404).send("No record found");
  // return res.status(200).json({ booksbytitle: result });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooks = new Promise((resolve, reject) => {
    let result = [];
    var book_array = Object.entries(books)
    book_array.forEach((item, index) => {
        if (item[1].title == title) {
        var book = item[1];
          var book_obj = {
            isbn: index,
            title: book.title,
            reviews: book.reviews
          }
          result.push(book_obj)
        }
    })

    if(result.length == 0) reject("No records found");
    else resolve(result)
  })

  getBooks.then((resolve)=>{
    return res.status(200).json({booksbytitle: resolve});
  }, (reject) => {
    return res.status(404).send(reject);
  }).catch((error) => {
    return res.status(500).send("Something went wrong")
  })
  return res.send(result);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  var book_array = Object.entries(books)
  book_array.map((item, index) => {
    if (index == isbn) {
      return res.status(200).json(item[1].reviews);
    }
  })
  return res.status(404).send("Book not found");
  // 5-getbookreview.png
});

module.exports.general = public_users;
