const db = require('../config/connection');
const collection = require('../config/collection');
const objectId = require('mongodb').ObjectId
const fs = require('fs')


module.exports = {
    checkExist : (data)=>{
        return new Promise((resolve, reject)=>{
            data.Name = data.Name.toUpperCase();
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({Name : data.Name}).then((exist)=>{
               if(exist){
                console.log('exist');
                if(fs.existsSync('./public/images/category/'+ data.Image)){
                    console.log('if of exist');
                    fs.unlink('./public/images/category/'+ data.Image, ()=>{})
                }
                reject()
               }else{
                resolve()
               }
            })
        })
    },
    addCategory : (data)=>{
        return new Promise((resolve, reject)=>{
            data.Name = data.Name.toUpperCase()
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response)=>{
            resolve(response)
        })
        })
        
    },
    getAllCategories : ()=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
            })
        })
    },
    deleteCategory : (categoryId)=>{
        return new Promise(async(resolve, reject)=>{
            const data = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id : objectId(categoryId)})
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id: objectId(categoryId)}).then(res =>{
                if(fs.existsSync('./public/images/category/'+ data.Image)){
                    console.log('if of exist');
                    fs.unlink('./public/images/category/'+ data.Image, ()=>{})
                }
                resolve(res)
            })
        })
    },
    editCategory : (categoryId, data)=>{
        return new Promise((resolve, reject)=>{
            data.Name = data.Name.toUpperCase();
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id : objectId(categoryId)}, {
               $set: { Name : data.Name}
            }).then(res =>{
                resolve(res)
            })
        })
    }
    
}