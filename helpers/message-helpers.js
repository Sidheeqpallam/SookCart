const db = require('../config/connection');
const collection = require('../config/collection');


module.exports = {
    sendMessage : (data)=>{
        return new Promise((resolve, reject)=>{
             db.get().collection(collection.MESSAGE_COLLECTION).insertOne(data).then((res)=>{
            resolve()
        })
        })
       
    }
}