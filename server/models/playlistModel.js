const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    date:{
        $type: String,
        required: true,
        //unique:true
    },
    country:{
        $type: String,
        required: true,
    },
    totalPlays:{
        $type: Number,
        required: true
    },
    songs:[{
        name:{
            $type: String,
            required:true
        },
        ranking: {
            $type: Number,
            required: true,
        },
        artists:[{
            external_urls: {spotify: String },
            href: String,
            id: String,
            name: String,
            type: String,
            uri: String,
        }],
        id: {
            $type: String,
            required: true
        },
        plays: {
            $type: Number,
            required: true
        }
    }],
},
{ typeKey: '$type' }
);

exports.PlaylistCL = mongoose.model('CL_Playlist',playlistSchema);
exports.PlaylistAR = mongoose.model('AR_Playlist',playlistSchema);
exports.PlaylistCOL = mongoose.model('COL_Playlist',playlistSchema);
exports.PlaylistSPA = mongoose.model('SPA_Playlist',playlistSchema);
exports.PlaylistGL = mongoose.model('GL_Playlist',playlistSchema);
exports.PlaylistPE = mongoose.model('PE_Playlist',playlistSchema);
exports.PlaylistMEX = mongoose.model('MEX_Playlist',playlistSchema);
exports.PlaylistEC = mongoose.model('EC_Playlist',playlistSchema);
exports.PlaylistRD = mongoose.model('RD_Playlist',playlistSchema);
