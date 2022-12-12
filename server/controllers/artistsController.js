const ArtistsModels = require("../models/artistsModel");
const APIFeatures = require('../utils/APIfeatures');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync')

const matchCountry = function(request){
    const country = request.params.country;
    let Artists
    switch (country) {
        case 'argentina':
            Artists = ArtistsModels.ArtistsAR
            break;
        case 'chile':
            Artists = ArtistsModels.ArtistsCL
            break;
        case 'colombia':
            Artists = ArtistsModels.ArtistsCOL
            break;
        case 'spain':
            Artists = ArtistsModels.ArtistsSPA
            break;
        case 'global':
            Artists = ArtistsModels.ArtistsGL
            break;
        case 'peru':
            Artists = ArtistsModels.ArtistsPE
            break;
        case 'ecuador':
            Artists = ArtistsModels.ArtistsEC
            break;
        case 'mexico':
            Artists = ArtistsModels.ArtistsMEX
            break;
        case 'dominican_republic':
            Artists = ArtistsModels.ArtistsRD
            break;
        default:
            console.log('Error')
            break;
    }
    return Artists
}

exports.getArtists = catchAsync(async function(request,response){
    const Artists = matchCountry(request)
    const query = await Artists.find()
    response.status(200).json({
        status: 'success',
        records: query.length,
        data:{
            query
        }
    });
});

exports.getArtist = catchAsync(async function(request,response){ /// getArtistV2 -> es más rápido
    console.log('getArtist')
    console.log(request.params)
    const artistID = request.params.artist
    console.log('artistID',artistID);
    /// Vamos a buscar al artista a todas las playlists.

    const arrayPromises = [ /// Corre las 9 promesas en paralelo.
        new APIFeatures(ArtistsModels.ArtistsAR.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsCL.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsCOL.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsEC.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsGL.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsMEX.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsPE.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsRD.find({"artists.id":artistID}),request.query).sort().paginate(),
        new APIFeatures(ArtistsModels.ArtistsSPA.find({"artists.id":artistID}),request.query).sort().paginate(),
    ];

    /// Get all Data and Artist name
    const data = [];
    let artistName;
    const countries = ['argentina','chile','colombia','ecuador','global','mexico','peru','dominican republic','spain']; ///Mismo orden de las queries
    for (let i = 0;i < arrayPromises.length;i++){
        const playlistData = await arrayPromises[i].query
        if (!artistName){
            if (playlistData.length > 0){
                /// Get data.
                const playlist = playlistData[0];
                const playlistArtistInfo =  playlist.artists.filter((artistObj)=>{
                    return artistObj.id === artistID
                });
                artistName = playlistArtistInfo[0].name
            }
        }
        data.push(playlistData)
    }
    ///console.log('queries',queries)

    const artistData = countries.reduce((accObj,country,index)=>{
        /// Agrupamos el country a la querie correspondiente!
        const query = data[index];
        const artistsData = getArtistData(query,artistID) /// El obj query es {status:'', value: data}
        //console.log(data)
        if (artistsData === "No hay entradas para esta canción"){
            records = 0;
        } else {
            records = artistsData.length;
        }
        accObj[country] = {
            records,
            artistsData
            };
        return accObj
    },{});
    if (!artistName){
        return response.status(200).json({
            status: 'fail',
            message: 'There is no data for this ID.'
        }); 
    }
    response.status(200).json({
        status: 'success',
        data: {
            name : artistName,
            id : artistID,
            countries: artistData
        }
    });
});

const getArtistData = function(queryData,artistID){
    if (queryData.length === 0){ /// No hay resultado, devolvemos.
        return 'No hay entradas para esta canción';
    }
    data = queryData.map((playlist,index,array)=>{ /// Pasamos de toda la info de playlist a solo las canciones de este artista.
        const playlistArtistInfo =  playlist.artists.filter((artistObj)=>{
            return artistObj.id === artistID
        });
        const newPlaylist = {
            date: playlist.date,
            songsQty : playlistArtistInfo[0].songsQty,
            totalPlays : playlistArtistInfo[0].totalPlays,
            songs : playlistArtistInfo[0].songs,
        };
        return newPlaylist
    });

    return data
};

exports.getArtistV2 = catchAsync(async function(request,response,next){ /// Este es más rápido!
    console.log(request.params)
    const limit = request.query.limit*1 || 7;
    const artistID = request.params.artist
    const queryObject = {...request.query}; /// Copy of query.
    const excludedFields = ['page','sort','limit','fields','plays'];
    excludedFields.forEach(element => delete queryObject[element]); /// Sacamos los keywords del objeto
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, matched => `$${matched}`); // regex!
    queryString = JSON.parse(queryString)
    const pipeAggegators = [
        {
            $unwind: '$artists'
        },
        {
            $match: {'artists.id': artistID}
        },
        {
            $sort: {date:-1}
        },
        {
            $limit: limit
        },
        {
            $project: {
                'artists_qty' : 0,
            }
        },
        {
            $match: { ///  /.*/g matchea todo!
                "date": queryString?.date ||  /.*/g,
            }
        }
    ]
    const aggregationResults = [
        await ArtistsModels.ArtistsAR.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsCL.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsCOL.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsEC.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsGL.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsMEX.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsRD.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsPE.aggregate(pipeAggegators),
        await ArtistsModels.ArtistsSPA.aggregate(pipeAggegators)
    ]
    let country = 'Argentina'; /// Partimos con el primer país y luego cambia si encuentra data en otro.
    let artistName; /// Get artist name from one of the results.
    for (let i=0;i<aggregationResults.length;i++){
        if (aggregationResults[i][0]?.artists?.name){
            artistName = aggregationResults[i][0].artists.name
            break
        }
    }
    const mappedData = aggregationResults.reduce((acc0,dataPerCountry)=>{
        if (dataPerCountry.length === 0){ /// Guard Clause. Si no hay datos debemos retornar.
            return acc0
        }
        reducedCountry = dataPerCountry.reduce((acc,playlist)=>{
            country = playlist.country; /// Solo cambiará el pais si esque hay data!
            acc.push({
                date:playlist.date,
                totalPlays : playlist.artists.totalPlays,
                songsQty : playlist.artists.songs.length,
                songs: playlist.artists.songs,
            })
            return acc
        },[]);
        acc0[country.toLowerCase()] = {
            records : reducedCountry.length,
            data: reducedCountry
        }
        return acc0
    },{})
    if (Object.keys(mappedData).length === 0){
        return next(new AppError(`No info for artistID : ${artistID}`));
    }

    response.status(200).json({
        status:'success',
        countries : aggregationResults.length,
        data : {
            name: artistName,
            id: artistID,
            countries : mappedData
        }
    })

});