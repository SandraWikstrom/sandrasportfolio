const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require('./data.js')

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

app.get("/about-me", function (request, response) {
  
    const model = {
    reviews: data.reviews
  }

  response.render("about.hbs", model);
});

app.listen(8080);
