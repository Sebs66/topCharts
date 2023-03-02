const express = require('express');
const playlistController = require('../controllers/playlistController');
const utils = require('../utils/middleware')
const catchAsync = require('../utils/catchAsync')

const router = express.Router();

const docsController = catchAsync(async function(request,response){
    response.status(200).json({
        status: 'success',
        message: `This is the root of the api/v1 endpoint.`,
        description: "This API works along with a database with historical records of Spotify's TOP50 for a list of countries, to retrieve information of the playlists.",
        available_countries: ['argentina','chile','colombia','spain','global','dominican_republic','ecuador','mexico','peru'],
        endpoints:{
            'v1/artist': 'Gives information organized by artist.',
            'v1/playlists':'Gives information organized by playlists',
            'v1/songs':'Gives infromation organized by song'
        },
        comment:'Visit each endpoint for more information on their specific usage'
    });
});

router.route('/')
    .get(docsController)

module.exports = router;


