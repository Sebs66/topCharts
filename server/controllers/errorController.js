const AppError = require('../utils/appError');

//* Production enviroment.
const sendErrorProd = (err,response) =>{
    if (err.isOperational){ //* Only send custom information of errors correctly handled.
        response.status(err.statusCode).json({
            status:err.status,
            message: err.message,
        });
    } else { //* Send generic error with little info.
        console.log(err) //* for server logs.
        response.status(500).json({
            status:'error',
            message:'Something went wrong!'
        });
    }
}

//* Developer enviroment: As much info as possible.
const sendErrorDev = (err,response) =>{
    response.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

module.exports = (err,request,response,next)=>{ //* with four arguments, express identifies this function as an errorHandling middleware!
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    //* Based on the enviroment:
    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err,response)
    } else if (process.env.NODE_ENV === 'production'){
        //* Will depend on the specific operational error.
        sendErrorProd(err,response)
    }
}