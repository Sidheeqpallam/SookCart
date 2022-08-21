const db = require('../config/connection');
const collection = require('../config/collection');
// const adminModel = require('../models/admin-model');


module.exports = {
    doSignIn:(data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.ADMIN_COLLECTION).findOne({Email: data.Email, Password : data.Password}).then((admin)=>{
                if(admin){
                    resolve(admin)
                }else{
                    reject()
                }
            })
        })
    },
    
}
























































































    // doSignUp: (data)=>{
    //     return new Promise((resolve, reject)=>{
    //         const {Email, Password} = data;
    //         newAdmin = new adminModel({
    //             Email, 
    //             Password
    //         })
    //         newAdmin.save().then((response)=>{
    //             console.log(response);
    //             resolve(response)
    //         })
    //     })
    // }