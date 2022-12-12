class APIFeatures {
    constructor(query,requestQuery){
        this.query = query,
        this.queryString = requestQuery
    }

    filter() {
        const queryObject = {...this.queryString}; /// Hacemos una copia del obj para poder modificarlo.
        const excludedFields = ['page','sort','limit','fields','plays'];
        excludedFields.forEach(element => delete queryObject[element]); /// Sacamos los keywords del objeto
        let queryString = JSON.stringify(queryObject);
        //console.log(queryString)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, matched => `$${matched}`); // regex!
        this.query = this.query.find(JSON.parse(queryString))
        return this
    }

    limitFields() { //h2 Field limiting.
        if (this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields) //h1 Con query.select() especificamos que fields son los que queremos.
        } else { /// default behaviour si esque no seteamos ningun field.
            if (!this.queryString.date){
                this.query = this.query.select('-__v -songs')
            } else {
                this.query = this.query.select('-__v')
            }
        }
        return this; /// Retornamos el objeto para poder encadenar los métodos.
    }

    paginate(){
        const page = this.queryString.page *1 || 1; /// Short circuiting. si no hay field = page => 1.
        const limit = this.queryString.limit*1 || 7;
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    sort(){
        if (this.queryString.sort){
            const sortBy = this.queryString.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else { /// Default entrega las playlist desde la más reciente.
            this.query = this.query.sort('-date'); 
        };
        return this
    }
}

module.exports = APIFeatures;