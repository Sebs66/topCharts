const mongoose = require('mongoose');
const dotenv = require('dotenv');

//* Uncaught Exceptions -> de codigo sincrónico no manejadas en nuestro codigo.
process.on('uncaughtException',err => {
    console.log('uncaughtException - Shutting down...');
    console.log(err);
    process.exit(1); /// el codigo 1 indica que el proceso termino por un error.
});

dotenv.config({path:'./.config.env'}); /// Indicamos donde están guardadas las variables.
console.log('NODE_ENV =',process.env.NODE_ENV)

const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD); /// url de conneccion.

mongoose
    .connect(DB,{
        /// Options!
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(()=>{
        console.log('DB connection successful.')
    });

PORT = process.env.PORT || 3000;
const server = app.listen(PORT,()=>console.log(`Listening on port ${PORT}...`))

//* Unhandled rejections. condigo asyncrónico.
process.on('unhandledRejection',err =>{
    console.log('unhandledRejection - Shutting down...');
    console.log(err);
    server.close(()=>{
        process.exit(1); /// Una vez se haya cerrado el server, terminamos el proceso.
    });
});