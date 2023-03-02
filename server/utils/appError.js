class AppError extends Error{
    constructor(message,statusCode){
        super(message); //* Error class with message parameter only! 
        //* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
        //* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; /// fail for 400s statusCode, error for 500s statusCode
        this.isOperational = true; /// All instances of AppError will be operational errors.
        Error.captureStackTrace(this,this.constructor) /// Create .stack property on a target object 
    }
}

module.exports = AppError