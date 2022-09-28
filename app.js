const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("sandrasportfolio-database.db");

//Creates table for blogs
db.run(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY,
    blogpost TEXT
  )
`);

//Creates table for reviews
db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY,
    evaluation TEXT,
    grade INTEGER
  )
`);

//Creates table for faqs
db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

//Creates table for answers to faqs
db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY,
    approvedQuestion TEXT,
    answer TEXT
  )
`);

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("static"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

//Get requests for "static" pages
app.get("/", function (request, response) {
  response.render("home.hbs");
});

app.get("/portfolio", function (request, response) {
  response.render("portfolio.hbs");
});

app.get("/contact-me", function (request, response) {
  response.render("contact.hbs");
});

app.get("/log-in", function (request, response) {
  response.render("login.hbs");
});

//Get request for BLOG
app.get("/blog", function (request, response) {
  const query = `SELECT * FROM blogs`;

  db.all(query, function (error, blogs) {
    const model = {
      blogs,
    };

    response.render("blog.hbs", model);
  });
});

//Get request for BLOG-ADMIN
app.get("/blog-admin", function (request, response) {
  const query = `SELECT * FROM blogs`;

  db.all(query, function (error, blogs) {
    const model = {
      blogs,
    };

    response.render("blog-admin.hbs", model);
  });
});

//Post request for BLOG-ADMIN
app.post("/blog-admin", function (request, response) {
  const blogpost = request.body.blogpost;

  const query = `INSERT INTO blogs (blogpost) VALUES (?)`;

  const value = [blogpost];

  db.run(query, value, function (error) {
    response.redirect("/blog-admin");
  });
});

//Get request for REVIEWS
app.get("/about-me", function (request, response) {
  const query = `SELECT * FROM reviews`;

  db.all(query, function (error, reviews) {
    const model = {
      reviews,
    };

    response.render("about.hbs", model);
  });
});

//Post request for REVIEWS
app.post("/about-me", function (request, response) {
  const evaluation = request.body.evaluation;
  const grade = request.body.grade;

  const query = `INSERT INTO reviews (evaluation, grade) VALUES (?, ?)`;

  const values = [evaluation, grade];

  db.run(query, values, function (error) {
    response.redirect("/about-me");
  });
});

//Get request for FAQ
app.get("/faq", function (request, response) {
  const query = `SELECT * FROM answers`;

  db.all(query, function (error, answers) {
    const model = {
      answers,
    };

    response.render("faq.hbs", model);
  });
});

//Post request for FAQ
app.post("/faq", function (request, response) {
  const question = request.body.question;

  const query = `INSERT INTO faqs (question) VALUES (?)`;

  const value = [question];

  db.run(query, value, function (error) {
    response.redirect("/faq");
  });
});

//Get request for FAQ-ADMIN
app.get("/faq-admin", function (request, response) {
  const query = `SELECT * FROM faqs`;

  db.all(query, function (error, faqs) {
    const model = {
      faqs,
    };

    response.render("faq-admin.hbs", model);
  });
});

//Post request for FAQ-ADMIN
app.post("/faq-admin", function (request, response) {
  const answer = request.body.answer;
  const approvedQuestion = request.body.approvedQuestion;

  const query = `INSERT INTO answers (answer, approvedQuestion) VALUES (?, ?)`;

  const values = [answer, approvedQuestion];

  db.run(query, values, function (error) {
    response.redirect("/faq-admin");
  });
});

app.listen(8080);
