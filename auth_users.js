const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username is not empty and doesn't contain spaces
    return username && username.trim().length > 0 && !username.includes(' ');
}

const authenticatedUser = (username, password) => {
    // Check if user exists in records and password matches
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // returns true if user exists, false otherwise
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Create JWT token
        const accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
        
        // Store the token in the session
        req.session.authorization = { accessToken };
        
        return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.body.username // Assuming username is stored in session

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Convert isbn to number since the books object uses numeric keys
    const numericIsbn = parseInt(isbn);
    
    if (!books[numericIsbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    books[numericIsbn].reviews[username] = review;

    return res.status(200).json({ 
        message: "Review added/updated successfully",
        book: books[numericIsbn]
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;

    // Convert isbn to number since the books object uses numeric keys
    const numericIsbn = parseInt(isbn);
    
    if (!books[numericIsbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[numericIsbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review
    delete books[numericIsbn].reviews[username];

    return res.status(200).json({ 
        message: "Review deleted successfully",
        book: books[numericIsbn]
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;