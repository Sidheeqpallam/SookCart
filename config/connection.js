const MongoClient = require('mongodb').MongoClient
const state = {
    db: null
}

module.exports.connect = (done)=>{
    const url = `mongodb+srv://sidheeq:${process.env.MONGODB_ATLES_PASSWORD}@cluster0.jrifige.mongodb.net/?retryWrites=true&w=majority`;
    const dbname = 'SookCart';

    MongoClient.connect(url, (err, data)=>{
        if(err) return done(err);
        state.db = data.db(dbname);
        done()
    })
}

module.exports.get = ()=>{
    return state.db;
}