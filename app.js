const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const intilizeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running at http://localhost:3001");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intilizeDBandServer();

const moviesDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const allMoviesQuery = "SELECT * FROM movie;";
  const allMovies = await db.all(allMoviesQuery);
  const movies = allMovies.map((eachMovie) => ({
    movieName: eachMovie.movie_name,
  }));
  response.send(movies);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(moviesQuery);
  response.send(moviesDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorID, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id,movie_name,lead_actor)
  VALUES
    ( ${directorID},
        '${movieName}',
        '${leadActor}');
    `;
  const addMovie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorID, movieName, leadActor } = request.body;
  const putMovieQuery = `
  UPDATE 
    movie 
  SET
    director_id=${directorID},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
  WHERE
    movie_id = ${movieId}
    `;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delMovieQuery = `
    DELETE
    FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  await db.run(delMovieQuery);
  response.send("Movie Removed");
});
const directorsDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = "SELECT * FROM director;";
  const getDirectors = await db.all(getDirectorQuery);
  response.send(
    getDirectors.map((each) => {
      directorsDbObjectToResponseObject(each);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT * FROM movie WHERE director_id = '${directorId}';`;
  const getMovies = await db.all(getDirectorMoviesQuery);
  response.send(getMovies.map((each) => ({ movieName: each.movie_name })));
});
module.export = app;
