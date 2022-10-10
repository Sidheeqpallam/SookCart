const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const { response } = require("express");

// const vendorModel = require("../models/vendor-model");

module.exports = {
  checkVendorExist: (data) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.VENDOR_COLLECTION).findOne({MobileNo: data.MobileNo}).then((response)=>{
            if (response) {
          reject();
        } else {
          resolve();
        }
        })
    });
  },
  doSignUp: (data) => {
    return new Promise(async (resolve, reject) => {
      data.Password = await bcrypt.hash(data.Password, 10);
      db.get().collection(collection.VENDOR_COLLECTION).insertOne(data).then((response)=>{
        resolve(response);
      })
     
    });
  },

  
  doSignIn: (data) => {
    return new Promise(async (resolve, reject) => {
      const response = {};
      const validStatus = {};
      const vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ MobileNo: data.MobileNo })
        if (vendor) {
          bcrypt.compare( data.Password, vendor.Password).then((status) => {
          if (status) {
              response.vendor = vendor;
              response.status = true;
              resolve(response);
            } else {
              validStatus.invalidPassword = true;

              reject(validStatus);
            }
          });
        } else {
          validStatus.vendorNotFound = true;
          reject(validStatus);
        }
      });
    
  },

  getDetails: (vendorId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.VENDOR_COLLECTION).findOne({ _id: objectId(vendorId) }).then((data) => {
          resolve(data);
        });
    });
  },
  getVendors: () => {
    return new Promise((resolve, reject) => {
    db.get().collection(collection.VENDOR_COLLECTION).find().toArray((err, vendors)=>{
        resolve(vendors)
    })
    });
  },
  deleteVendor : (vendorId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collection.VENDOR_COLLECTION).deleteOne({_id: objectId(vendorId)}).then((data)=>{
          resolve(data)
        })
    })
  },
  editVendor : (newData)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id: objectId(newData.params.id)},{$set:{
        Fname : newData.body.Fname,
        Lname : newData.body.Lname,
        Email : newData.body.Email,
        MobileNo : newData.body.MobileNo
      }}).then((response)=>{
        resolve(response)
      })
    })
  },
  blockVendor : (vendorId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id: objectId(vendorId)},{$set:{
      block: 'blocked'
    }}).then((data)=>{
      resolve(data)
    })
    })
    
  },unBlockVendor : (vendorId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id: objectId(vendorId)},{$set:{
      block: ''
    }}).then((data)=>{
      resolve(data)
    })
    })
    
  }
};



// checkVendorExist: (data) => {
//     return new Promise((resolve, reject) => {
//       const { MobileNo, Password } = data;
//       newVender = new vendorModel({
//         MobileNo,
//         Password,
//       });
//       newVender.findOne().then((response) => {
//         if (response) {
//           reject();
//         } else {
//           resolve();
//         }
//       });
//     });
//   }

// doSignUp: (data) => {
//     return new Promise(async (resolve, reject) => {
//       data.Password = await bcrypt.hash(data.Password, 10);
//       const { Fname, Lname, Email, MobileNo, Password } = data;
//       newVender = new vendorModel({
//         Fname,
//         Lname,
//         Email,
//         MobileNo,
//         Password,
//       });
//       newVender.save().then((response) => {
//         resolve(response);
//       });
//     });
//   },