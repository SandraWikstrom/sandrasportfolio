const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("sandrasportfolio-database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY,
    evaluation TEXT
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
		extended: false
	})
)

app.get("/", function (request, response) {
  response.render("home.hbs");
});

app.get("/portfolio", function (request, response) {
  response.render("portfolio.hbs");
});

app.get("/portfolio-admin", function (request, response) {
  response.render("portfolio-admin.hbs");
});

app.get("/about-me", function (request, response) {
  const query = `SELECT * FROM reviews`;

  db.all(query, function (error, reviews) {
    const model = {
      reviews,
    };

    response.render("about.hbs", model);
  });
});

app.post("/about-me", function (request, response) {
  const evaluation = request.body.evaluation;

  const query = `INSERT INTO reviews (evaluation) VALUES (?)`;

  const value = [evaluation];

  db.run(query, value, function(error) {
    response.redirect("/about-me");
  });
});

app.get("/contact-me", function (request, response) {
  response.render("contact.hbs");
});

app.get("/log-in", function (request, response) {
  response.render("login.hbs");
});

app.listen(8080);
