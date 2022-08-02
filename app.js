const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require('./routes/users-routes');
const postsRoutes = require('./routes/posts-routes');
const commentsRoutes = require('./routes/comments-routes')
const HttpError = require('./models/http-error');
const CONFIG = require('./config.json');

const app = express();

app.options("*", cors()); 

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, content-type, x-auth-token"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'Unknown error.' });
});

mongoose
    .connect(`mongodb+srv://${CONFIG.mongo.username}:${CONFIG.mongo.password}@cluster0.ivvcwqd.mongodb.net/Forum?retryWrites=true&w=majority`)
    .then(() => {
        //app.listen(5000);
        app.listen(5000, () => { console.log("Connected") });
    })
    .catch(err => {
        console.log(err);
    });

