const AppError = require('./utils/appError');
const express = require('express');
const morgan = require('morgan');

const errorHandler = require('./controllers/errorController');
const playlistsRouter = require('./routes/playlistsRouter');
const artistsRouter = require('./routes/artistsRouter');
const songsRouter = require('./routes/songsRouter');
const apiV1Docs = require('./routes/docsRouter');

const app = express(); /// creamos la APP.
app.use(express.json()); /// Middleware para rescatar body de post request como json.
app.use(morgan('dev')); /// Middleware para logueo de requests.

app.use('/api/v1/playlists',playlistsRouter);
app.use('/api/v1/artists',artistsRouter);
app.use('/api/v1/songs',songsRouter);
app.use('/api/v1',apiV1Docs);
app.all('*',(request,response,next)=>{ //* For unhandled routes.
    next(new AppError(`Can't find ${request.originalUrl} on the server`,404)) //* Argument passed into next() for express to recognized as an error!
});
app.use(errorHandler); //* To manage diferent types of operational errors.

module.exports = app