const PlaylistModels = require('../models/playlistModel');
const APIFeatures = require('../utils/APIfeatures');
const PlaylistClass = require('../utils/playlistClass');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')

const matchCountryPlaylist = function(request){
    const country = request.url.split('/')[1].split('?')[0];
    let Playlist
    switch (country) {
        case 'argentina':
            Playlist = PlaylistModels.PlaylistAR
            break;
        case 'chile':
            Playlist = PlaylistModels.PlaylistCL
            break;
        case 'colombia':
            Playlist = PlaylistModels.PlaylistCOL
            break;
        case 'spain':
            Playlist = PlaylistModels.PlaylistSPA
            break;
        case 'global':
            Playlist = PlaylistModels.PlaylistGL
            break;
        case 'mexico':
            Playlist = PlaylistModels.PlaylistMEX
            break;
        case 'ecuador':
            Playlist = PlaylistModels.PlaylistEC
            break;
        case 'dominican_republic':
            Playlist = PlaylistModels.PlaylistRD
            break;
        case 'peru':
            Playlist = PlaylistModels.PlaylistPE
            break;
        default:
            break;
    }
    return Playlist
}

exports.getAllPlaylists = catchAsync (async function(request,response,next){
    /// Elegir el modelo/collection correcto según la url/endpoint
    const Playlist = matchCountryPlaylist(request)

    const features = new APIFeatures(Playlist,request.query)
        .filter()
        .limitFields()
        .sort()
        .paginate();

    const playlists = await features.query;
    if (playlists.length === 0){
        if (Object.keys(request.query).length > 0){
            next(new AppError('No results for this query',404))
        } else{
            next(new AppError('No playlist found',404))
        };
    }
    response.status(200).json({
        status: 'success',
        records: playlists.length,
        data: {
            playlists
        }
    });
});

exports.getPlaylist = catchAsync (async function(request,response){
    console.log('entramos en :id')
    const Playlist = matchCountryPlaylist(request)
        const playlist = await Playlist.findById(request.params.id);
        response.status(200).json({
            status: 'success',
            data: {
                playlist
            }
        });
});

exports.postPlaylist = catchAsync (async function(request,response){
    const Playlist = matchCountryPlaylist(request)
    const bodyCopy = {...request.body}
    const newPlaylist = await Playlist.create(bodyCopy);
    response.status(201)
        .json({
            status: 'success',
            message: 'Playlist añadida a DB',
            data: newPlaylist
        });
});

exports.deletePlaylist = catchAsync (async function(request,response){
    const Playlist = matchCountryPlaylist(request)
    await Playlist.findByIdAndRemove(request.params.id);
    response.status(204).json({
        status:'success',
        message: 'Removed item',
        data:null,
    });
});

exports.deleteAllPlaylists = catchAsync (async function(request,response){
    const Playlist = matchCountryPlaylist(request)
    await Playlist.deleteMany();
    response.status(204).json({
        status:'success',
        message: 'Removed item',
        data:null,
    });        
});

exports.updatePlaylist = catchAsync (async function(request,response){
    const country = request.url.split('/')[1];      
    let Playlist
    switch (country) {
        case 'argentina':
            Playlist = PlaylistModels.PlaylistAr
            break;
        case 'chile':
            Playlist = PlaylistModels.PlaylistCL
            break;
        case 'colombia':
            Playlist = PlaylistModels.PlaylistCol
            break;
        case 'spain':
            Playlist = PlaylistModels.PlaylistSPA
            break;
        case 'global':
            Playlist = PlaylistModels.PlaylistGL
            break;
        default:
            break;
    }
    const playlist = await Playlist.findByIdAndUpdate(
        /// findIdAnUpdate solo actualiza lo que cambia!
        request.params.id, /// el objeto a actualizar
        request.body, /// el body que actualiza
        {
            new: true, /// retorna el nuevo objeto actualizado en vez del original.
            runValidators: true,
        }
    )
});

exports.getPlaylistsStats = catchAsync (async function(request,response){
    const Playlist = matchCountryPlaylist(request)
    let stats
    let records = [1]
    if (Object.keys(request.query).length === 0 && request.query.constructor === Object){ /// Verificamos si el objeto está vacío o no
        //console.log('Empty object')
        stats = await Playlist.aggregate([
            {
                $group: {
                    _id: null,
                    numPlaylists: {$sum: 1},
                    avgPlays: {$avg: '$totalPlays'},
                    minPlays: {$min: '$totalPlays'},
                    maxPlays: {$max: '$totalPlays'}
                }
            }
        ]);
        stats[0].avgPlays = Math.trunc(stats[0].avgPlays)

    } else { /// Si tenemos fields extra.
        if (request.query.song){
            console.log('/stats?song')
            const songID = request.query.song;
            let basePlaylist = await Playlist.findOne({
                "songs.id" : songID
            });
            if (!basePlaylist){
                throw new AppError('Song not found.',404)
            }
            let query = Playlist.find({
                "songs.id" : songID
            });
            songInfo = basePlaylist.songs.filter((song)=>{
                return song.id === songID
            });
            //query = query.select("-songs.artists")
            query = await query;
            records = query.reduce((acc,playlist)=>{
                const playlistClass = new PlaylistClass(playlist)
                const songObject = playlistClass.song(songID)
                const info = {
                    date: playlist.date,
                    ranking: songObject.ranking,
                    plays: songObject.plays,
                }
                acc.push(info)
                return acc
            },[])
            //console.log('records',records)
            stats = {
                records,
                country: basePlaylist.country,
                song: {
                    _id:songInfo[0]._id,
                    name:songInfo[0].name,
                    artists:songInfo[0].artists,
                    id:songInfo[0].id,
                }
            }
        }
    }

    response.status(200).json({
        status: 'success',
        records: records.length,
        data: {
            stats,
        }
    });
});

exports.getPlaylistsSong = catchAsync (async function(request,response,next){
    console.log('Entramos a /stats/song')
    console.log(request.query)
    if (Object.keys(request.query).length === 0 && request.query.constructor === Object){ /// Verificamos si el objeto está vacío o no
        console.log('error')
        next(new AppError('Please select a spotify song ID'));
    }
});