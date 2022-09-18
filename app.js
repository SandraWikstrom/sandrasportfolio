const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data.js");

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("static"));

app.get("/", function (request, response) {
  response.render("home.hbs");
});

app.get("/portfolio", function (request, response) {
  response.render("portfolio.hbs");
});

app.get("/about-me", function (request, response) {
  const model = {
    reviews: data.reviews,
  };

  response.render("about.hbs", model);
});

app.get("/contact-me", function (request, response) {
  response.render("contact.hbs");
});

app.get("/log-in", function (request, response) {
  response.render("login.hbs");
});

app.listen(8080);
