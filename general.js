const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Username must not contain spaces and must not be empty" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Using Promise to simulate async operation
    new Promise((resolve) => {
        resolve(books);
    })
    .then((booksData) => {
        return res.status(200).json(booksData);
    })
    .catch(() => {
        return res.status(500).json({ message: "Error fetching books" });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    })
    .then((book) => {
        return res.status(200).json(book);
    })
    .catch((err) => {
        return res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    new Promise((resolve) => {
        const booksByAuthor = [];
        for (const isbn in books) {
            if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
                booksByAuthor.push({ isbn, ...books[isbn] });
            }
        }
        resolve(booksByAuthor);
    })
    .then((books) => {
        if (books.length > 0) {
            return res.status(200).json({ books });
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    })
    .catch(() => {
        return res.status(500).json({ message: "Error searching for author" });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    
    new Promise((resolve) => {
        const booksByTitle = [];
        for (const isbn in books) {
            if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                booksByTitle.push({ isbn, ...books[isbn] });
            }
        }
        resolve(booksByTitle);
    })
    .then((books) => {
        if (books.length > 0) {
            return res.status(200).json({ books });
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    })
    .catch(() => {
        return res.status(500).json({ message: "Error searching for title" });
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book.reviews);
        } else {
            reject("Book not found");
        }
    })
    .then((reviews) => {
        return res.status(200).json({ reviews });
    })
    .catch((err) => {
        return res.status(404).json({ message: err });
    });
});

module.exports.general = public_users;