// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database');
const nodemailer = require('nodemailer');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Настройка сессий
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Используйте secure: true, если используете HTTPS
}));

// Middleware для проверки аутентификации
function checkAuth(req, res, next) {
    if (req.session.user && req.session.user === 'yioly') {
        next();
    } else {
        res.redirect('/login');
    }
}

// Страница логина
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'yioly' && password === 'yioly') {
        req.session.user = 'yioly';
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
});

// Админ интерфейс, защищённый аутентификацией
app.get('/admin', checkAuth, (req, res) => {
    db.all("SELECT * FROM books", [], (err, rows) => {
        if (err) throw err;
        res.render('admin', { books: rows });
    });
});

// Главная страница
app.get('/', (req, res) => {
  db.all("SELECT * FROM books", [], (err, rows) => {
    if (err) throw err;
    res.render('index', { books: rows });
  });
});


// Добавление книги
app.post('/add', (req, res) => {
  const { title, author, category, year, price, status } = req.body;
  db.run("INSERT INTO books (title, author, category, year, price, status) VALUES (?, ?, ?, ?, ?, ?)", [title, author, category, year, price, status], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

// Обновление книги
app.post('/update/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, category, year, price, status } = req.body;
  db.run("UPDATE books SET title = ?, author = ?, category = ?, year = ?, price = ?, status = ? WHERE id = ?", [title, author, category, year, price, status, id], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

// Удаление книги
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM books WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

// Просмотр отдельной книги
app.get('/book/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
    if (err) throw err;
    res.render('book', { book: row });
  });
});

// Сортировка книг
app.get('/sort', (req, res) => {
  const { category, author, year } = req.query;
  let query = "SELECT * FROM books WHERE 1=1";
  let params = [];
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (author) {
    query += " AND author = ?";
    params.push(author);
  }
  if (year) {
    query += " AND year = ?";
    params.push(year);
  }
  db.all(query, params, (err, rows) => {
    if (err) throw err;
    res.render('sort', { books: rows });
  });
});

// Аренда книги
app.post('/rent/:id', (req, res) => {
  const { id } = req.params;
  const { user, rentPeriod } = req.body;
  const rentDate = new Date().toISOString().split('T')[0];
  db.run("INSERT INTO rentals (book_id, user, rent_period, rent_date) VALUES (?, ?, ?, ?)", [id, user, rentPeriod, rentDate], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Напоминания об окончании аренды
const sendReminderEmails = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const currentDate = new Date().toISOString().split('T')[0];
  db.all("SELECT * FROM rentals WHERE rent_date <= date(?, '-3 months')", [currentDate], (err, rows) => {
    if (err) throw err;
    rows.forEach(row => {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: row.user,
        subject: 'Rental Period Ending Soon',
        text: `Your rental period for book ID ${row.book_id} is ending soon. Please return or renew your rental.`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  });
};

// Запуск напоминаний каждую ночь
setInterval(sendReminderEmails, 24 * 60 * 60 * 1000);

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
