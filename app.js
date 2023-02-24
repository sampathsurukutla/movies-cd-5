const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializationDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//API 1 -- GET

app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT 
     movie_name
    FROM
     movie;`;
  const moviesArray = await db.all(getAllMovies);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 2 -- POST

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
     INSERT INTO
      movie(director_id, movie_name, lead_actor)
     VAlUES
      (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
        );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//API 3 -- GET
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT 
     *
    FROM
     movie
    WHERE
     movie_id = ${movieId};`;
  const movie = await db.get(getMovie);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4 -- PUT
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
      UPDATE
       movie
      SET
       director_id = '${directorId}',
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
      WHERE
       movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API5 -- DELETE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
      DELETE FROM 
       movie
      WHERE
       movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API6 -- GET

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT 
     *
    FROM
     director;`;
  const directorsArray = await db.all(getAllDirectors);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//API7 -- GET

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirector = `
    SELECT 
     movie_name as movieName
    FROM
     movie
    WHERE
     director_id = ${directorId};`;
  const movies = await db.all(getMoviesByDirector);
  response.send(movies);
});

module.exports = app;
