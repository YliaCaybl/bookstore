// seed.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/bookstore.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, category TEXT, year INTEGER, price REAL, status TEXT)");

  const books = [
    { title: 'Пикник на обочине', author: 'Аркадий и Борис Стругацкие', category: 'Фантастика', year: 1972, price: 10.99, status: 'available' },
    { title: 'Метро 2033', author: 'Дмитрий Глуховский', category: 'Фантастика', year: 2005, price: 8.99, status: 'available' },
    { title: 'Азазель', author: 'Борис Акунин', category: 'Детектив', year: 1998, price: 12.99, status: 'available' },
    { title: 'Бессмертный', author: 'Александра Маринина', category: 'Детектив', year: 1995, price: 9.99, status: 'available' },
    { title: 'Мастер и Маргарита', author: 'Михаил Булгаков', category: 'Мистика', year: 1966, price: 14.99, status: 'available' },
    { title: 'Дом, в котором...', author: 'Мариам Петросян', category: 'Мистика', year: 2009, price: 11.99, status: 'available' }
  ];

  const stmt = db.prepare("INSERT INTO books (title, author, category, year, price, status) VALUES (?, ?, ?, ?, ?, ?)");
  books.forEach(book => {
    stmt.run(book.title, book.author, book.category, book.year, book.price, book.status);
  });
  stmt.finalize();

  console.log("Books have been added to the database.");
});

db.close();
