const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const PlaylistModel = require('./models/playlistModel');

dotenv.config({path:'./server/.config.env'});

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
const files = fs.readdirSync('./data') /// List with all files.
const filesFiltered = files.reduce((acc,file_string)=>{
    if (file_string.includes('temp') || file_string.includes('Artists')){
        return acc
    }
    const obj = JSON.parse(fs.readFileSync(`./data/${file_string}`,'utf-8'))
    const country = obj.country
    //console.log('country',country.toLowerCase())
    acc[country.toLowerCase()].push(obj) 
    return acc
    },{chile:[],argentina:[],colombia:[],spain:[],global:[],ecuador:[],dominican_republic:[],peru:[],mexico:[]});

console.log(Object.keys(filesFiltered))

/// IMPORT DATA TO DB.
const importData = async function(){
    try {
        console.log('Argentina');
        await PlaylistModel.PlaylistAR.create(filesFiltered.argentina);
        console.log('Chile');
        await PlaylistModel.PlaylistCL.create(filesFiltered.chile);
        console.log('Colombia');
        await PlaylistModel.PlaylistCOL.create(filesFiltered.colombia);
        console.log('Spain');
        await PlaylistModel.PlaylistSPA.create(filesFiltered.spain);
        console.log('Global');
        await PlaylistModel.PlaylistGL.create(filesFiltered.global);
        console.log('Ecuador');
        await PlaylistModel.PlaylistEC.create(filesFiltered.ecuador);
        console.log('Mexico');
        await PlaylistModel.PlaylistMEX.create(filesFiltered.mexico);
        console.log('Dominican Republic');
        await PlaylistModel.PlaylistRD.create(filesFiltered.dominican_republic);
        console.log('Peru');
        await PlaylistModel.PlaylistPE.create(filesFiltered.peru);

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
        await PlaylistModel.PlaylistAR.deleteMany(); /// deleteMany vacío borra todo lo que hay en la collection.
        await PlaylistModel.PlaylistCL.deleteMany();
        await PlaylistModel.PlaylistCOL.deleteMany();
        await PlaylistModel.PlaylistSPA.deleteMany();
        await PlaylistModel.PlaylistGL.deleteMany();
        await PlaylistModel.PlaylistEC.deleteMany();
        await PlaylistModel.PlaylistMEX.deleteMany();
        await PlaylistModel.PlaylistRD.deleteMany();
        await PlaylistModel.PlaylistPE.deleteMany();
        console.log('Data Deleted!')
    } catch (err) {
        console.log('error\n')
        console.log('Error',err.message)
    }
    process.exit()
};