const mongoose = require('mongoose');

const artistsSchema = new mongoose.Schema({
    country: {
        $type: String,
        required: true,
    },
    date: {
        $type: String,
        required: true,
        unique: true,
    },
    artists_qty:{
        $type: Number,
        required: true,
    },
    artists: [{
        name:{
            $type: String,
            required: true,
        },
        totalPlays: {
            $type: Number,
            required: true,
        },
        id: {
            $type: String,
            required: true,
        },
        songs: [{
            name:{
                $type: String,
                required: true,
            },
            plays:{
                $type: String,
                required: true,
            },
            id:{
                $type: String,
                required: true,
            },
            ranking: {
                $type: String,
                required: true,
            }
        }],
        songsQty: {
            $type: Number,
            required: true
        }
    }]
    
},{ typeKey: '$type' });

exports.ArtistsCL = mongoose.model('CL_Artistst',artistsSchema);
exports.ArtistsAR = mongoose.model('AR_Artist',artistsSchema);
exports.ArtistsCOL = mongoose.model('COL_Artist',artistsSchema);
exports.ArtistsSPA = mongoose.model('SPA_Artist',artistsSchema);
exports.ArtistsGL = mongoose.model('GL_Artist',artistsSchema);
exports.ArtistsPE = mongoose.model('PE_Artist',artistsSchema);
exports.ArtistsMEX = mongoose.model('MEX_Artist',artistsSchema);
exports.ArtistsEC = mongoose.model('EC_Artist',artistsSchema);
exports.ArtistsRD = mongoose.model('RD_Artist',artistsSchema);
