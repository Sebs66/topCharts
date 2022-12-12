const availableCountries = process.env.availableCountries.split(',');
const AppError = require('./appError');

exports.checkCountry = function(request,response,next){ /// MiddleWare!
    //console.log(request.url)
    const country = request.url.split('/')[1].split('?')[0];
    //console.log(country,availableCountries.includes(country))
    if (!availableCountries.includes(country)){ /// Si está mal escrito el country
        return next(new AppError(`Invalid Country. Currently availables countries: ${availableCountries}`,400))
        };
    next();
};