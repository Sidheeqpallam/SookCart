const db = require('../config/connection');
const collection = require('../config/collection');
const objectId = require('mongodb').ObjectId

module.exports = {
    addCoupon : (coupon)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then(res =>{
                resolve(res)
            })
        })
    },
    getAllCoupon : ()=>{
        return new Promise(async(resolve, reject)=>{
          const coupons = await  db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        })
    },
    deleteCoupon : (couponId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id : objectId(couponId)}).then(res =>{
                resolve(res)
            })
        })
    },
    checkCoupon : (code, userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).findOne({Code: code}).then(coupon =>{
                if(!coupon){
                    resolve()
                }else{
                if('usedUsers' in coupon){
                    let status = false; 
                    for(i of coupon.usedUsers){
                        if(i == userId){
                            status = true;
                            break;
                        }
                    }
                    if(!status){
                        resolve(coupon)
                    }else{
                        resolve({coupon, status})
                    }
                }else{
                    resolve(coupon)
                }
            }
            })
        })
    },
    couponUsing : (userId, couponId)=>{
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id : objectId(couponId)}, {$push: {'usedUsers' : userId}})
    },
    editCoupon : (couponId , data)=>{
        return new Promise((resolve, reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id : objectId(couponId)}, {
            $set : {
                Name : data.Name,
                Code : data.Code,
                Percentage : data.Percentage,
                Discription : data.Discription
            }
        }).then(()=>{
            resolve()
        })

        })
    }
}