const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;

module.exports = {
  isBlocked : (user)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(user._id)}).then((status)=>{
        if(status.block){
          reject()
        }else{
          resolve()
        }
      })
    })
  },




  checkUserExist: (userData) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ MobileNo: userData.MobileNo }).then((exist) => {
          if (exist) {
            reject();
          } else {
            resolve();
          }
        });
    });
  },
  doSignUp:  (userData) => {
    return new Promise(async(resolve, reject)=>{
      userData.Password = await bcrypt.hash(userData.Password, 10);
    db.get().collection(collection.USER_COLLECTION).insertOne({
      Name : userData.Name,
      MobileNo : userData.MobileNo,
      Email : userData.Email,
      Password : userData.Password,
    }).then((data) => {
        resolve(data);
      });
    })
    
  },
  doSignIn: (userData) => {
    return new Promise(async (resolve, reject) => {
      const response = {};
      const validStatus = {};
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ MobileNo: userData.MobileNo });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            validStatus.invalidPassword = true;

            reject(validStatus);
          }
        });
      } else {
        validStatus.userNotFound = true;
        reject(validStatus);
      }
    });
  },
  getDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((data) => {
          resolve(data);
        });
    });
  },
  getDetailsUsingMobileNo: (mobileNo)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).findOne({MobileNo: mobileNo}).then((data)=>{
      resolve(data)
    })
    })
    
  },



  getUsers: () => {
    return new Promise((resolve, reject) => {
    db.get().collection(collection.USER_COLLECTION).find().toArray((err, users)=>{
      console.log(err);
        resolve(users)
    })
    });
  },
  deleteUser : (userId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({_id: objectId(userId)}).then((data)=>{
          resolve(data)
        })
    })
  },
  editUser : (newData)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(newData.params.id)},{$set:{
        Fname : newData.body.Fname,
        Lname : newData.body.Lname,
        Email : newData.body.Email,
        MobileNo : newData.body.MobileNo
      }}).then((response)=>{
        resolve(response)
      })
    })
  },
  blockUser : (userId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId)},{$set:{
      block: true
    }}).then((data)=>{
      resolve(data)
    })
    })
    
  },unBlockUser: (userId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId)},{$set:{
      block: false
    }}).then((data)=>{
      resolve(data)
    })
    })
    
  },
  test : ()=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).find().toArray((err, users)=>{
        console.log(users);
        console.log(err);
          resolve(users)
      })
    })
  },

  addAdress : (address, userId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id : objectId(userId)}, {$push: {Address : address}}).then(res=>{
        resolve(res)
      })
    })
  },

  getAddress: (userId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)},{projection: {_id : 0, Address : 1}} ).then(res =>{
        resolve(res)
      })
    })
  },























addToWishList : (userId, proId)=>{
  db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId) },  {$push:{ Wish : proId}})
  return new Promise( (resolve, reject)=>{
    
     db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(proId) }, {$push:{ Wishers : userId}}).then(response=>{
      resolve(response);
      console.log(response);
     })   
    }
  )}
}
