class PlaylistClass {
    constructor(playlist){
        this.name = playlist.name,
        this.country = playlist.country,
        this.date = playlist.date,
        this.totalPlays = playlist.totalPlays,
        this._id = playlist._id,
        this.songs = playlist.songs
    }

    song(song_id){ /// Retorna el objeto de la canción.
        const array = this.songs.filter((song)=>{
            return song.id === song_id
        });      
        return array[0]
    
    }
}

module.exports = PlaylistClass;