//* Wrapper for async functions.
module.exports = (fn)=>{
    return (request,response,next)=>{
        fn(request,response,next).catch(err => {
            next(err)
        });
        //* Catch any error and pass it to the errorHandler middleware through next(err)
    }
}