const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");

const reviewMaxLength = 50;
const faqMaxLength = 50;
const blogpostMaxLength = 100;
const answerMaxLength = 50;
const approvedQuestionMaxLength = 50;

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

  const errorMessages = [];

  if (blogpost == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (blogpostMaxLength < blogpost.length) {
    errorMessages.push(
      "Blogpost can't be longer than " + blogpostMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO blogs (blogpost) VALUES (?)`;

    const value = [blogpost];

    db.run(query, value, function (error) {
      response.redirect("/blog-admin");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("blog-admin.hbs", model);
  }
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
  const grade = parseInt(request.body.grade, 10);

  const errorMessages = [];

  if (evaluation == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (reviewMaxLength < evaluation.length) {
    errorMessages.push(
      "Review can't be longer than " + reviewMaxLength + " characters."
    );
  }

  if (isNaN(grade)) {
    errorMessages.push("Put a number as the grade.");
  } else if (grade < 0) {
    errorMessages.push("Grade can't be lower than 0");
  } else if (grade > 10) {
    errorMessages.push("Grade can't be higher than 10");
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO reviews (evaluation, grade) VALUES (?, ?)`;

    const values = [evaluation, grade];

    db.run(query, values, function (error) {
      response.redirect("/about-me");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("about.hbs", model);
  }
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

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (faqMaxLength < question.length) {
    errorMessages.push(
      "Question can't be longer than " + faqMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO faqs (question) VALUES (?)`;

    const value = [question];

    db.run(query, value, function (error) {
      response.redirect("/faq");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("faq.hbs", model);
  }
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

  const errorMessages = [];

  if (answer == "") {
    errorMessages.push("The answer-field can't be empty");
  } else if (answerMaxLength < answer.length) {
    errorMessages.push(
      "Answer can't be longer than " + answerMaxLength + " characters."
    );
  }
  if (approvedQuestion == "") {
    errorMessages.push("The question-field can't be empty");
  } else if (approvedQuestionMaxLength < approvedQuestion.length) {
    errorMessages.push(
      "Question can't be longer than " +
        approvedQuestionMaxLength +
        " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO answers (answer, approvedQuestion) VALUES (?, ?)`;

    const values = [answer, approvedQuestion];

    db.run(query, values, function (error) {
      response.redirect("/faq-admin");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("faq-admin.hbs", model);
  }
});

//Post request for FAQ
app.post("/faq", function (request, response) {
  const question = request.body.question;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (faqMaxLength < question.length) {
    errorMessages.push(
      "Question can't be longer than " + faqMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO faqs (question) VALUES (?)`;

    const value = [question];

    db.run(query, value, function (error) {
      response.redirect("/faq");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("faq.hbs", model);
  }
});

app.listen(8080);
