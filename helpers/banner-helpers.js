const db = require('../config/connection');
const collection = require('../config/collection');
const fs = require('fs');
const objectId = require('mongodb').ObjectId



module.exports = {
    addBanner : (data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((res)=>{
            resolve(res.insertedId)
        })
        })
        
    },
    deleteBanner : (bannerId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id : objectId(bannerId)}).then(response =>{
                    if(fs.existsSync('public/images/banner/' +response.Image)){
                        fs.unlink('public/images/banner/' + response.Image, ()=>{})
                    }
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id: objectId(bannerId)}).then(res =>{
                     resolve(res)
                }) 
            })
        })
    },
    getBanner : ()=>{
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collection.BANNER_COLLECTION).find().toArray().then(data =>{
                resolve(data)
            
            })
            }catch(e){
                console.log(e);
            }
            
        })
    }
}