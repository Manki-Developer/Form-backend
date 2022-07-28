const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require('./routes/users-routes');
const threadsRoutes = require('./routes/threads-routes');
const HttpError = require('./models/http-error');
const CONFIG = require('./config.json');

const app = express();

app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/threads', threadsRoutes);

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

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register', async (req, res) => {
    console.log(req.body)
    res.json({ status: 'ok' });
});

mongoose
    .connect(`mongodb+srv://${CONFIG.mongo.username}:${CONFIG.mongo.password}@cluster0.ivvcwqd.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        //app.listen(5000);
        app.listen(5000, () => { console.log("Connected") });
    })
    .catch(err => {
        console.log(err);
    });

