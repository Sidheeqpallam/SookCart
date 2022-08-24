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
                      '$unwind': {
                        'path': '$cart'
                      }
                    }, {
                      '$group': {
                        '_id': '$date', 
                        'total': {
                          '$sum': '$cart.totalAmount'
                        }
                      }
                    }, {
                      '$group': {
                        '_id': null, 
                        'data': {
                          '$push': {
                            'date': '$_id', 
                            'total': '$total'
                          }
                        }
                      }
                    }, {
                      '$unwind': {
                        'path': '$data'
                      }
                    }, {
                      '$sort': {
                        'data.date': 1
                      }
                    }, {
                      '$group': {
                        '_id': '$_id', 
                        'data': {
                          '$push': '$data'
                        }
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'data': 1
                      }
                    }
                  ]
            ).toArray()
            // function CreateDate(dateString) {
            //     var arr = dateString.split('/');
            //     return new Date(arr[2] , arr[1], arr[0]);
            // }
            
            // function sortRecords(records) {    
            //     var sorted = records.sort(function (a, b) {        //this function is not working on my server side. so I move to alernate.
            //         return CreateDate(a.date) > CreateDate(b.date);
            //     });
            // }
            // sortRecords(data[0].data)
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
        
    },
    getSaleReport : ()=>{
      return new Promise(async(resolve, reject)=>{
        const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            '$unwind': {
              'path': '$cart'
            }
          }, {
            '$set': {
              'user': {
                '$toObjectId': '$user'
              }
            }
          }, {
            '$lookup': {
              'from': 'user', 
              'localField': 'user', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$project': {
              '_id': 0, 
              'Product_id': '$cart.product.id', 
              'Product_Name': '$cart.productDetails.Name', 
              'Category': '$cart.productDetails.Category', 
              'Customer_id': '$user._id', 
              'Customer': '$user.Name', 
              'Price': {
                '$subtract': [
                  {
                    '$toInt': '$cart.productDetails.Price'
                  }, {
                    '$multiply': [
                      {
                        '$toInt': '$cart.productDetails.Price'
                      }, {
                        '$divide': [
                          18, 100
                        ]
                      }
                    ]
                  }
                ]
              }, 
              'Tax_rate': '18', 
              'Tax': {
                '$multiply': [
                  {
                    '$toInt': '$cart.productDetails.Price'
                  }, {
                    '$divide': [
                      18, 100
                    ]
                  }
                ]
              }, 
              'Total': '$cart.productDetails.Price', 
              'Discount_rate': '$cart.productDetails.Discount', 
              'Discount': {
                '$multiply': [
                  {
                    '$toInt': '$cart.productDetails.Discount'
                  }, {
                    '$divide': [
                      {
                        '$toInt': '$cart.productDetails.Price'
                      }, 100
                    ]
                  }
                ]
              }, 
              'Discount_Price': '$cart.productDetails.DiscountPrice', 
              'Coupon': '$coupon.Percentage', 
              'Coupon_Discount': {
                '$multiply': [
                  {
                    '$toInt': '$cart.productDetails.DiscountPrice'
                  }, {
                    '$divide': [
                      {
                        '$toInt': '$coupon.Percentage'
                      }, 100
                    ]
                  }
                ]
              }, 
              'Quantity': '$cart.product.quantity', 
              'Grand_Total': '$cart.totalAmount'
            }
          }
        ]).toArray()
        resolve(data)
      })
    }

}


