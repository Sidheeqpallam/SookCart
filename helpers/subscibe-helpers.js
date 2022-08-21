const db = require('../config/connection');
const collection = require('../config/collection');


module.exports = {
    addToSubsciption : (data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.SUBSCIBE_COLLECTION).insertOne(data).then(()=>{
                resolve()
            })
        })
    }
}