const db = require('../config/connection');
const collection = require('../config/collection');
const objectId = require('mongodb').ObjectId


module.exports = {
    getAnOrder : (id)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id : objectId(id) }).then(res =>{
                resolve(res)
            })
        })
    },
    getOrdersWithUserId: (userId)=>{
        return new Promise(async(resolve, reject)=>{
          const orders = await  db.get().collection(collection.ORDER_COLLECTION).find({user : userId}).toArray()
          resolve(orders)
        })
    },
    getAllOrders : ()=>{
        return new Promise(async(resolve, reject)=>{
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    changePaymentStatus : (orderId) =>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : objectId(orderId)},
             {$set : {
                status : 'placed'

            }}).then((res)=>{
                resolve()
            })
        })
    },
    changeOrderStatus : (orderId, newStatus)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : objectId(orderId)}, {$set: {status : newStatus}}).then(res =>{
                resolve(res)
            })
        })
    },
    getDayWiseTotalSalesAmount : ()=>{
        return new Promise(async(resolve, reject)=>{
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        "$unwind" : {
                            "path" : "$cart"
                        }
                    }, 
                    {
                        "$group" : {
                            "_id" : "$date",
                            "total" : {
                                "$sum" : "$cart.totalAmount"
                            }
                        }
                    }, 
                    {
                        "$group" : {
                            "_id" : null,
                            "data" : {
                                "$push" : {
                                    "date" : "$_id",
                                    "total" : "$total"
                                }
                            }
                        }
                    }, 
                    {
                        "$project" : {
                            "data" : 1.0,
                            "_id" : 0.0
                        }
                    }
                ], 
                {
                    "allowDiskUse" : false
                }
            ).toArray()
            function CreateDate(dateString) {
                var arr = dateString.split('/');
                return new Date(arr[2] , arr[1], arr[0]);
            }
            
            function sortRecords(records) {    
                var sorted = records.sort(function (a, b) {        
                    return CreateDate(a.date) > CreateDate(b.date);
                });
            }
            sortRecords(data[0].data)
            resolve(data[0].data)
        })
    },
    categoryWiseSaleQty : ()=>{
        return new Promise(async(resolve, reject)=>{
            const sale =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    "$unwind" : {
                        "path" : "$cart"
                    }
                }, 
                {
                    "$group" : {
                        "_id" : "$cart.productDetails.Category",
                        "count" : {
                            "$sum" : 1.0
                        }
                    }
                }
                
            ], 
            {
                "allowDiskUse" : false
            }).toArray()
            resolve(sale)
        })
        
    }

}


