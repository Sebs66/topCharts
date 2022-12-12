const express = require('express');
const artistsController = require('../controllers/artistsController');
const utils = require('../utils/middleware');

const router = express.Router();

router.route('/:artist')
    .get(artistsController.getArtistV2);

router.route('/country/:country')
    .get(artistsController.getArtists);


module.exports = router;