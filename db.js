const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("sandrasportfolio-database.db");

//Creates table for blogs
db.run(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blogtitle TEXT,
    blogpost TEXT
  )
`);

//Creates table for reviews
db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation TEXT,
    grade INTEGER
  )
`);

//Creates table for faqs
db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT
  )
`);

//Creates table for answers to faqs
db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    approvedQuestion TEXT,
    answer TEXT
  )
`);

exports.getAllBlogs = function(callback){
    const query = `SELECT * FROM blogs`;

    db.all(query, function (error, blogs) {
        callback(error, movies)
    })
}


exports.createMovie = function(title, grade, callback){
    const query = INSERT INTO movies (title, grade) VALUES (?, ?)
    const values = [title, grade]

    db.run(query, values, function(error){
        callback(error)
    })
}

/*db.createMovie(title, grade, function(error){
    if(error) {
        errorMessages.push
    }
} in the hbs-file.

exports.getMovieById = function(id, callback){
    const query = SELECT * FROM movies WHERE id = ?
    const values = [id]
    db.get(query, values, function(error, movie){
        callback(error, movie)
    })
}

app.get("/movies/:id", function(request, response){
    const blabla
})
db.getMovieById(id, function(error, movie))
const model = {
    movie,
}

response.render()*/