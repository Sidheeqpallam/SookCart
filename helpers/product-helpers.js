const db = require('../config/connection')
const collection = require('../config/collection');
const fs = require('fs');
const objectId = require('mongodb').ObjectId


module.exports = {
    addProduct: (data)=>{
        return new Promise((resolve, reject)=>{
            data.DiscountPrice = parseInt(data.Price) - (parseInt(data.Price) / 100 * parseInt(data.Discount))
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(data).then(res =>{
                resolve(res.insertedId)
            })
        })
    },
    editProduct : (proId, data, files)=>{
        return new Promise(async(resolve, reject)=>{
            data.DiscountPrice = parseInt(data.Price) - (parseInt(data.Price) / 100 * parseInt(data.Discount))
            if(files[0]){
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : objectId(proid)}).then(response =>{
                    response.Images.forEach(image => {
                        fs.unlink('public/images/product/' + image, ()=>{})
                    })});                        
                let images = []
                for(var i = 0 ; i < files.length ; i++){
                    images[i] = files[i]
                }
                data.Images = images;
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(proId)}, 
                {
                    $set: {
                        Name : data.Name,
                        Brand : data.Brand,
                        Price : data.Price,
                        Size : data.Size,
                        Colour : data.Colour,
                        Quantity : data.Quantity,
                        Discount: data.Discount,
                        Discription : data.Discription,
                        DiscountPrice : data.DiscountPrice,
                        Images : data.Images
                        
                    }
                }).then(()=>{
                    resolve()
                })
            }else{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(proId)}, 
                {
                    $set: {
                        Name : data.Name,
                        Brand : data.Brand,
                        Price : data.Price,
                        Size : data.Size,
                        Colour : data.Colour,
                        Quantity : data.Quantity,
                        Discount: data.Discount,
                        Discription : data.Discription,
                        DiscountPrice : data.DiscountPrice        
                    }
                }).then(()=>{
                    resolve()
                })
            }
        })
    },
    deleteProduct : (productId)=>{
        
            return new Promise((resolve, reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : objectId(productId)}).then(response =>{
                    response.Images.forEach(image => {
                        fs.unlink('public/images/product/' + image, ()=>{})
                    });                        
                    db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: objectId(productId)}).then(res =>{
                         resolve(res)
                    }) 
                })
            })
       
    },
    getProduct : ()=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((products)=>{
                resolve(products)
            })
        })
    },
    getProductById : (proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : objectId(proId)}).then(res =>{
                resolve(res)
            })
        })
    },
    getProductByCategory : (category)=>{
        return new Promise(async(resolve, reject)=>{
          const products = await  db.get().collection(collection.PRODUCT_COLLECTION).find({Category : category}).toArray();
          resolve(products)
        })
    },
    getDetailsOfProduct : (proId)=>{

    },
    Product : ()=>{},
    


    getAllOrders : ()=>{
        return new Promise(async(resolve, reject)=>{
        const orders = await db.get().collection(collection.USER_COLLECTION).aggregate(
                [
                    {
                        "$unwind" : {
                            "path" : "$Cart"
                        }
                    }, 
                    {
                        "$group" : {
                            "_id" : {
                                "user" : "$_id",
                                "product" : "$Cart"
                            },
                            "count" : {
                                "$sum" : 1.0
                            }
                        }
                    }
                ], 
                {
                    "allowDiskUse" : false
                }
            ).toArray()
    for(one of orders){
        one.user = await db.get().collection(collection.USER_COLLECTION).findOne({_id : objectId(  one._id.user)})
        one.product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : objectId(one._id.product)})
    }
    resolve(orders);
        })
    }, 
    categoryWiseProductQty : ()=>{
        return new Promise(async(resolve, reject)=>{
          const data= await  db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                [
                    {
                        "$group" : {
                            
                            "_id" : "$Category",
                            "count" : {
                                "$sum" : 1.0
                            }
                        }
                    }
                    
                ], 
                {
                    "allowDiskUse" : false
                }
            ).toArray()
            resolve(data)
        })
    }
}