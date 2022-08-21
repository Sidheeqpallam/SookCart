const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");


const env = require('dotenv').config()
const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET
});

cartHelper = {
  addToCart: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      const proObj = {
        id: proId,
        quantity: 1,
      };
      const cartExist = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: userId });
      if (cartExist) {
        console.log(cartExist);
        const proExist = cartExist.product.findIndex(
          (product) => product.id == proId
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: userId, "product.id": proId },
              {
                $inc: { "product.$.quantity": 1 },
              }
            )
            .then((res) => {
              resolve(res);
            });
        } else {
          console.log("product not exist");
          console.log(proId);
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne({ user: userId }, { $push: { product: proObj } })
            .then((res) => {
              resolve(res);
            });
        }
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne({
            user: userId,
            product: [proObj],
          })
          .then((res) => {
            resolve(res);
          });
      }
    });
  },
  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$product",
          },
        ])
        .toArray();
      for (i of cart) {
        i.productDetails = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(i.product.id) });
        i.totalAmount = 0;
        i.totalAmount =
          i.totalAmount + i.product.quantity * i.productDetails.DiscountPrice;
      }

      resolve(cart);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const count = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate(
          [
            {
              $match: {
                user: userId,
              },
            },
            {
              $project: {
                count: {
                  $sum: "$product.quantity",
                },
              },
            },
          ],
          {
            allowDiskUse: false,
          }
        )
        .toArray();
      resolve(count);
    });
  },
  deleteCart: (userId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne({ user: userId }, { $pull: { product: { id: proId } } })
        .then((res) => {
          console.log(res);
          resolve(res);
        });
    });
  },
  deleteCartFromAllUsers: ( proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne({}, { $pull: { product: { id: proId } } })
        .then((res) => {
          console.log(res);
          resolve(res);
        });
    });
  },
  changeQuantity: (details) => {
    return new Promise((resolve, reject) => {
      details.count = parseInt(details.count);
      details.quantity = parseInt(details.quantity);
      if (details.count == -1 && details.quantity == 1) {
        console.log("remove item");
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { product: { id: details.product } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart), "product.id": details.product },
            {
              $inc: { "product.$.quantity": details.count },
            }
          )
          .then((res) => {
            resolve(res);
          });
      }
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let totalAmount = 0;
      const total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$product",
          },
        ])
        .toArray();
      for (i of total) {
        i.productDetails = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(i.product.id) });
          console.log(3);
      }
      console.log(total);
      for (i of total) {
        totalAmount =
          totalAmount + i.product.quantity * i.productDetails.DiscountPrice;
      }
      resolve({ totalAmount });
    });
  },
  placeOrder: async (data, user) => {
    let cart = await cartHelper.getCart(user._id);
    let coupon = null;
    if(user.coupon){
      coupon = user.coupon
      for(i of cart){
        i.totalAmount = i.totalAmount - (i.totalAmount / 100 * parseInt(user.coupon.Percentage) )
      }
    }
    let status = null;
    if(data.paymentMethod == 'COD'){
     status = 'placed'
    }
    // split date and time
    let now = new Date()
    let date = now.toLocaleDateString();
    let time = now.toLocaleTimeString();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne({
          user: user._id,
          cart: cart,
          addressIndex: parseInt(data.address) ,
          paymentMethod: data.paymentMethod,
          coupon : coupon,
          status : status,
          date : date,
          time : time
        })
        .then((res) => {
          
          resolve(res);
        });
    });
  },
  deleteAllCart: (cartId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ _id: objectId(cartId) })
        .then((res) => {
          resolve(res);
        });
    });
  },
  deleteCartByUserId : (userId)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({user : userId },{$set: {product: []}}).then((res)=>{
        resolve()
      })
    })
  },
  generateRazorpay: (Order) => {
    return new Promise((resolve, reject) => {
      let totalAmount = 0;
      for (i of Order.cart) {
        totalAmount =  totalAmount + i.totalAmount // (i.productDetails.DiscountPrice * i.product.quantity);
      }
      var options = {
        amount: totalAmount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: ''+Order._id,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },
  verifyPayment : (details)=>{
    return new Promise(async(resolve, reject)=>{
      const crypto = require('crypto');
      let hmac =  crypto.createHmac('sha256', 'tfujWQpZzTYHiVrJDfwnbwWo');
      hmac.update( details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      hmac = hmac.digest('hex');

      if(hmac == details.payment.razorpay_signature){  
        resolve()                                    
      }else{                                         
        reject()
      }
    })
  },
};

module.exports = cartHelper;
