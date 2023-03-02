const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const ArtistsModel = require('./models/artistsModel');

dotenv.config({path:'./.config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD); /// url de conneccion.

mongoose.connect(DB,{
            /// Options!
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(()=>{
            console.log('DB connection successful.')
            if (process.argv[2] === '--import'){
                console.log('importData')
                importData()
            } else if (process.argv[2] === '--delete'){
                deleteData()
            }
        })
        .catch(err=>{console.log(err.message)})

/// READ TXT FILES.
const files = fs.readdirSync('../data') /// List with all files.
const filesFiltered = files.reduce((acc,file_string)=>{
    if (file_string.includes('temp') || !file_string.includes('Artists')){
        return acc
    }
    const obj = JSON.parse(fs.readFileSync(`../data/${file_string}`,'utf-8'))
    country = obj.country
    acc[country.toLowerCase()].push(obj) 
    return acc
    },{chile:[],argentina:[],colombia:[],spain:[],global:[],ecuador:[],dominican_republic:[],peru:[],mexico:[]});

console.log(Object.keys(filesFiltered))

/// IMPORT DATA TO DB.
const importData = async function(){
    try {
        console.log('Argentina')
        await ArtistsModel.ArtistsAR.create(filesFiltered.argentina);
        console.log('Chile');
        await ArtistsModel.ArtistsCL.create(filesFiltered.chile);
        console.log('Colombia');
        await ArtistsModel.ArtistsCOL.create(filesFiltered.colombia);
        console.log('Spain');
        await ArtistsModel.ArtistsSPA.create(filesFiltered.spain);
        console.log('Global');
        await ArtistsModel.ArtistsGL.create(filesFiltered.global);
        console.log('Peru');
        await ArtistsModel.ArtistsPE.create(filesFiltered.peru);
        console.log('Ecuador');
        await ArtistsModel.ArtistsEC.create(filesFiltered.ecuador);
        console.log('Mexico');
        await ArtistsModel.ArtistsMEX.create(filesFiltered.mexico);
        console.log('Dominican Republic');
        await ArtistsModel.ArtistsRD.create(filesFiltered.dominican_republic);

        console.log('Data loaded!')
    } catch (err) {
        console.log('Error',err.message)
    }
    process.exit()
};
/// DELETE ALL DATA FROM DB.
const deleteData = async ()=>{
    console.log('Deleting data')
    try {
        await ArtistsModel.ArtistsAR.deleteMany(); /// deleteMany vacío borra todo lo que hay en la collection.
        await ArtistsModel.ArtistsCL.deleteMany();
        await ArtistsModel.ArtistsCOL.deleteMany();
        await ArtistsModel.ArtistsSPA.deleteMany();
        await ArtistsModel.ArtistsGL.deleteMany();
        await ArtistsModel.ArtistsPE.deleteMany();
        await ArtistsModel.ArtistsEC.deleteMany();
        await ArtistsModel.ArtistsMEX.deleteMany();
        await ArtistsModel.ArtistsRD.deleteMany();
        console.log('Data Deleted!')
    } catch (err) {
        console.log('error')
        console.log('Error',err.message)
    }
    process.exit()
};


