const express = require('express');
const utils = require('../utils/middleware');
const songsController = require('../controllers/songsController');

const router = express.Router();


router.route('/v2/:song')
    .get(songsController.getSongV2);
router.route('/:song')
    .get(songsController.getSong);
router.route('/')
    .get(songsController.docs);
module.exports = router;