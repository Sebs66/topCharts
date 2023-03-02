const express = require('express');
const playlistController = require('../controllers/playlistController');
const utils = require('../utils/middleware')

const router = express.Router();

router.route('/:country')
    .get(utils.checkCountry,playlistController.getAllPlaylists)
    .post(playlistController.postPlaylist)
    .delete(playlistController.deleteAllPlaylists);
    
router.route('/:country/stats') /// Debemos poner esta arriba del otro!
    .get(utils.checkCountry,playlistController.getPlaylistsStats);

router.route('/:country/stats/song')
    .get(utils.checkCountry,playlistController.getPlaylistsSong);

router.route('/:country/:id')
    .get(utils.checkCountry,playlistController.getPlaylist)
    .delete(playlistController.deletePlaylist);

router.route('/')
    .get(playlistController.docs);
    
module.exports = router;