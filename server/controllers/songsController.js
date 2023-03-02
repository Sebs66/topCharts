const PlaylistModels = require("../models/playlistModel");
const APIFeatures = require('../utils/APIfeatures');
const PlaylistClass = require('../utils/playlistClass');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')

exports.getSong = catchAsync (async function(request,response){
    console.log('getSong()');
    const songID = request.params.song
    console.log('songID',songID)
    const arrayPromises = [
        new APIFeatures(PlaylistModels.PlaylistAR.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistCL.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistCOL.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistEC.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistGL.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistMEX.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistPE.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistRD.find({"songs.id":songID}),request.query).filter().sort().paginate(),
        new APIFeatures(PlaylistModels.PlaylistSPA.find({"songs.id":songID}),request.query).filter().sort().paginate(),
    ];
    
    const data = [];
    let songData;
    for (let i = 0;i < arrayPromises.length;i++){      
        const playlistData = await arrayPromises[i].query
        if (!songData){
            if (playlistData.length > 0){
                /// Get data.
                const playlist = playlistData[0];
                const playlistSongInfo =  playlist.songs.filter((songObj)=>{
                    return songObj.id === songID
                });
                songData = {
                    name: playlistSongInfo[0].name,
                    id: songID,
                    artists:  playlistSongInfo[0].artists,
                }
            }
        }
        data.push(playlistData)
    };
    const songObj = data.reduce((acc,playlistByCountryData,index)=>{
        if (playlistByCountryData.length > 0){
            songsDataByCountry = playlistByCountryData.map((playlistData)=>{
                const playlist = new PlaylistClass(playlistData);
                const songObject = playlist.song(songID);
                const info = {
                    date: playlistData.date,
                    ranking: songObject.ranking,
                    plays: songObject.plays,
                }
                return info
            });
            const country = playlistByCountryData[0].country
            acc[country.toLowerCase()] = {
                records: songsDataByCountry.length,
                songsData: songsDataByCountry}
        }
        return acc
    },{});
    response.status(200).json({
        status: 'success',
        data: {
            songData,
            countries:songObj
        }
    });
});

exports.getSongV2 = catchAsync (async function(request,response,next){
    //console.log(request.params)
    const limit = request.query.limit*1 || 7;
    const songID = request.params.song
    /// Debemos crear el objeto para el match.
    const queryObject = {...request.query}; /// Copy of query.
    const excludedFields = ['page','sort','limit','fields','plays'];
    excludedFields.forEach(element => delete queryObject[element]); /// Sacamos los keywords del objeto
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, matched => `$${matched}`); // regex!
    queryString = JSON.parse(queryString)
    const pipeAggegators = [
        {
            $unwind:'$songs'
        },
        {
            $match: {'songs.id':songID}
        },        
        {
            $sort: {date:-1}
        },
        {
            $limit: limit
        },
        {
            $project: {
                'songs.artists._id':0,
                '_id':0
            }
        },
        {
            $match: { ///  /.*/g matchea todo!
                "date": queryString?.date ||  /.*/g,
            }
        }
    ];
    const aggregationResults = [        
        await PlaylistModels.PlaylistAR.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistCL.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistCOL.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistEC.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistGL.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistMEX.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistRD.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistPE.aggregate(pipeAggegators),
        await PlaylistModels.PlaylistSPA.aggregate(pipeAggegators)
    ]
    let country = 'Argentina';
    let songName;
    let artistsInfo;
    for (let i=0;i<aggregationResults.length;i++){
        if (aggregationResults[i][0]?.songs?.name){
            songName = aggregationResults[i][0].songs.name
            artistsInfo = aggregationResults[i][0].songs.artists
            break
        }
    };
    const mappedData = aggregationResults.reduce((acc0,dataPerCountry)=>{
        if (dataPerCountry.length === 0){ /// Guard Clause. Si no hay datos debemos retornar.
            return acc0
        }
        reducedData = dataPerCountry.reduce((acc,playlist)=>{
            country = playlist.country; /// Sólo se actualiza si esque hay data para dicho país.
            acc.push({
                date: playlist.date,
                plays: playlist.songs.plays,
                ranking: playlist.songs.ranking
            })
            return acc
        },[]);
        acc0[country.toLowerCase()] = {
            records : reducedData.length,
            data: reducedData
        }
        return acc0
    },{});
    if (Object.keys(mappedData).length === 0){
        if ('date' in queryString){
            return next(new AppError(`No data for requested songID: ${songID}. Maybe try another date?`,404));
        }
        return next(new AppError(`No data for the songID: ${songID}`,404));
    }
    response.status(200).json({
        status:'success',
        countries: aggregationResults.length,
        data: {
            name: songName,
            id: songID,
            artists : artistsInfo,
            countries : mappedData
        }
    });
});

exports.docs = catchAsync(async function(request,response){
    response.status(200).json({
        status:'success',
        message:'This is the root for the songs endpoint. You can use this endpoint as follows:',
        endpoints:{
            'songs/v2/:id_song':{
                description: 'Gives you the records (playlist by date) per country for this songs.',
                extra_paramentes: {
                    limit: 'limit the number of records returned per country. Default is 7',
                    date: 'return the records for the specific date. Can be used with advance filtering. For example /songs/id_song?date[lt]=2022-12-30 will give you only records before the date 2022-12-30.'
                }
            }
        }
    })
});