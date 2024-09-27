// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/bookstore.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, category TEXT, year INTEGER, price REAL, status TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS rentals (id INTEGER PRIMARY KEY, book_id INTEGER, user TEXT, rent_period TEXT, rent_date TEXT)");
});

module.exports = db;


а тут я напишу что-то понятное 
