const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");
const { response } = require("express");
const bcrypt = require("bcryptjs/dist/bcrypt");
const SQLiteStore = require("connect-sqlite3")(expressSession);

const blogtitleMaxLength = 10;
const blogpostMaxLength = 1000;

const reviewMaxLength = 50;

const faqMaxLength = 50;
const answerMaxLength = 50;
const approvedQuestionMaxLength = 50;

const adminUsername = "draco";
const adminPassword =
  "$2a$08$PUImd3eEnS45KuB50kZNJulCzwlgI/f4uu4uVJQdewNjsKQ2YQPki";

const db = new sqlite3.Database("sandrasportfolio-database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blogtitle TEXT,
    blogpost TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation TEXT,
    grade INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: "fdgfdskdjslakfj",
    store: new SQLiteStore(),
  })
);

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn;

  response.locals.isLoggedIn = isLoggedIn;

  next();
});

app.get("/", function (request, response) {
  response.render("home.hbs");
});

app.get("/portfolio", function (request, response) {
  response.render("portfolio.hbs");
});

app.get("/admin", function (request, response) {
  response.render("admin.hbs");
});

app.get("/about", function (request, response) {
  response.render("about.hbs");
});

app.get("/logout", function (request, response) {
  response.render("logout.hbs");
});

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/logout");
});

app.get("/blog", function (request, response) {
  const query = `SELECT * FROM blogs`;

  db.all(query, function (error, blogs) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      blogs,
    };
    response.render("blog.hbs", model);
  });
});

app.get("/blog/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogs WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, blogs) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      blogs,
    };
    response.render("blogpost.hbs", model);
  });
});

app.get("/blog-admin", function (request, response) {
  if (request.session.isLoggedIn) {
    const query = `SELECT * FROM blogs`;

    db.all(query, function (error, blogs) {
      const errorMessages = [];
      if (error) {
        errorMessages.push("Internal server error");
      }
      const model = {
        errorMessages,
        blogs,
      };

      response.render("blog-admin.hbs", model);
    });
  } else {
    response.redirect("/blog-admin");
  }
});

app.post("/blog-admin", function (request, response) {
  const blogtitle = request.body.blogtitle;
  const blogpost = request.body.blogpost;

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("You have to log in.");
  }

  if (blogtitle == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (blogtitleMaxLength < blogtitle.length) {
    errorMessages.push(
      "Title can't be longer than " + blogtitleMaxLength + " characters."
    );
  }
  if (blogpost == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (blogpostMaxLength < blogpost.length) {
    errorMessages.push(
      "Blogpost can't be longer than " + blogpostMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO blogs (blogtitle, blogpost) VALUES (?, ?)`;

    const values = [blogtitle, blogpost];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        const model = {
          errorMessages,
          blogtitle,
          blogpost,
        };

        response.render("blog-admin.hbs", model);
      } else {
        response.redirect("/blog-admin");
      }
    });
  } else {
    const model = {
      errorMessages,
      blogtitle,
      blogpost,
    };
    response.render("blog-admin.hbs", model);
  }
});

app.post("/delete-blogtitle/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM blogs WHERE id = (?) `;

  db.run(query, id, function (error) {
    response.redirect("/blog-admin");
  });
});

app.get("/blogpost-update/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogs WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, blogs) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      blogs,
    };
    response.render("blogpost-update.hbs", model);
  });
});

app.post("/blogpost-update/:id", function (request, response) {
  const id = request.params.id;
  const blogpost = request.body.blogpost;
  const blogtitle = request.body.blogtitle;

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("You have to log in");
  }

  if (blogtitle == "") {
    errorMessages.push("The title can't be empty");
  } else if (blogtitleMaxLength < blogtitle.length) {
    errorMessages.push(
      "Title can't be longer than " + blogtitleMaxLength + " characters."
    );
  }
  if (blogpost == "") {
    errorMessages.push("The blogpost can't be empty");
  } else if (blogpostMaxLength < blogpost.length) {
    errorMessages.push(
      "Blogpost can't be longer than " + blogpostMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `UPDATE blogs SET blogpost = ?, blogtitle = ? WHERE id = ?`;
    const values = [blogpost, blogtitle, id];

    db.run(query, values, function (error) {
      response.redirect("/blog/" + id);
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("blogpost-update.hbs", model);
  }
});

app.get("/review", function (request, response) {
  const query = `SELECT * FROM reviews`;

  db.all(query, function (error, reviews) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      reviews,
    };

    response.render("review.hbs", model);
  });
});

app.post("/review", function (request, response) {
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
      response.redirect("/review");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("review.hbs", model);
  }
});

app.get("/review-admin", function (request, response) {
  if (request.session.isLoggedIn) {
    const query = `SELECT * FROM reviews`;

    db.all(query, function (error, reviews) {
      const errorMessages = [];
      if (error) {
        errorMessages.push("Internal server error");
      }
      const model = {
        errorMessages,
        reviews,
      };

      response.render("review-admin.hbs", model);
    });
  } else {
    response.redirect("/review-admin");
  }
});

app.post("/delete-review/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM reviews WHERE id = (?) `;

  db.run(query, id, function (error) {
    response.redirect("/review-admin");
  });
});

app.get("/review-update/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM reviews WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, reviews) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      reviews,
    };
    response.render("review-update.hbs", model);
  });
});

app.post("/review-update/:id", function (request, response) {
  const id = request.params.id;
  const evaluation = request.body.evaluation;
  const grade = parseInt(request.body.grade, 10);

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("You have to log in");
  }

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
    const query = `UPDATE reviews SET evaluation = ?, grade = ? WHERE id = ?`;
    const values = [evaluation, grade, id];

    db.run(query, values, function (error) {
      response.redirect("/review-admin/");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("review-update.hbs", model);
  }
});

app.get("/login", function (request, response) {
  response.render("login.hbs");
});

app.post("/login", function (request, response) {
  const enteredUsername = request.body.username;
  const enteredPassword = request.body.password;

  const errorMessages = [];

  if (enteredUsername == "") {
    errorMessages.push("The username can't be empty");
  } else if (enteredUsername != adminUsername) {
    errorMessages.push("Wrong Username.");
  }

  if (enteredPassword == "") {
    errorMessages.push("The password can't be empty");
  } else if (enteredPassword != adminPassword) {
    errorMessages.push("Wrong Password.");
  }

  if (enteredUsername == adminUsername) {
    bcrypt.compare(enteredPassword, adminPassword, function (error, result) {
      if (result) {
        request.session.isLoggedIn = true;
        response.redirect("/");
      } else {
        const model = {
          errorMessages,
        };
        response.render("login.hbs", model);
      }
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("login.hbs", model);
  }
});

app.get("/faq", function (request, response) {
  const query = `SELECT * FROM answers`;

  db.all(query, function (error, answers) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      answers,
    };

    response.render("faq.hbs", model);
  });
});

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

app.get("/faq-admin", function (request, response) {
  const query = `SELECT * FROM answers`;

  db.all(query, function (error, answers) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      answers,
    };

    response.render("faq-admin.hbs", model);
  });
});

app.post("/delete-answer/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM answers WHERE id = (?) `;

  db.run(query, id, function (error) {
    response.redirect("/faq-admin");
  });
});

app.get("/create-answer-admin", function (request, response) {
  if (request.session.isLoggedIn) {
    const query = `SELECT * FROM faqs`;

    db.all(query, function (error, faqs) {
      const errorMessages = [];
      if (error) {
        errorMessages.push("Internal server error");
      }
      const model = {
        errorMessages,
        faqs,
      };

      response.render("create-answer-admin.hbs", model);
    });
  } else {
    response.redirect("/login");
  }
});

app.post("/create-answer-admin", function (request, response) {
  const answer = request.body.answer;
  const approvedQuestion = request.body.approvedQuestion;

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("You have to log in.");
  }

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
      response.redirect("/create-answer-admin");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("create-answer-admin.hbs", model);
  }
});

app.post("/delete-faq/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM faqs WHERE id = (?) `;

  db.run(query, id, function (error) {
    response.redirect("/create-answer-admin");
  });
});

app.get("/faq-update/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM answers WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, answers) {
    const errorMessages = [];
    if (error) {
      errorMessages.push("Internal server error");
    }
    const model = {
      errorMessages,
      answers,
    };
    response.render("faq-update.hbs", model);
  });
});

app.post("/faq-update/:id", function (request, response) {
  const id = request.params.id;
  const approvedQuestion = request.body.approvedQuestion;
  const answer = request.body.answer;

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("You have to log in");
  }

  if (approvedQuestion == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (approvedQuestionMaxLength < approvedQuestion.length) {
    errorMessages.push(
      "Question can't be longer than " +
        approvedQuestionMaxLength +
        " characters."
    );
  }
  if (answer == "") {
    errorMessages.push("The text-field can't be empty");
  } else if (answerMaxLength < answer.length) {
    errorMessages.push(
      "Answer can't be longer than " + answerMaxLength + " characters."
    );
  }

  if (errorMessages.length == 0) {
    const query = `UPDATE answers SET approvedQuestion = ?, answer = ? WHERE id = ?`;
    const values = [approvedQuestion, answer, id];

    db.run(query, values, function (error) {
      response.redirect("/faq-admin/");
    });
  } else {
    const model = {
      errorMessages,
    };
    response.render("faq-update.hbs", model);
  }
});

app.listen(8080);
