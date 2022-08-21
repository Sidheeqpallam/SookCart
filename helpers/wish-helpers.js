const db = require("../config/connection");
const collection = require("../config/collection");
const { json } = require("body-parser");
const objectId = require("mongodb").ObjectId;

module.exports = {
  removeFromWhishlist: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { user: userId },
          {
            $pull: { products: proId },
          }
        )
        .then((response) => {
          console.log(response);
          resolve({ removeProduct: true });
        });
    });
  },
  removeFromAllWhishlist: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          {},
          {
            $pull: { products: proId },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  getWhishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$products",
          },
        ])
        .toArray();

      for (i of wishItems) {
        i.productDetails = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(i.products) });
      }
      resolve(wishItems);
    });
  },

  getWhishCount: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: userId })
        .then((list) => {
          resolve(list);
        });
    });
  },

  addToWhishlist: (proId, userId) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      let ExistInCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: userId, "product.id": proId });
      if (!ExistInCart) {
        let WhishExist = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({ user: userId });

        if (WhishExist) {
          let proExist = false;
          for (i of WhishExist.products) {
            if (i == proId) {
              proExist = true;
              break;
            }
          }
          if (proExist) {
            response.proExist = true;
            resolve(response);
          } else {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: userId },
                {
                  $push: { products: proId },
                }
              )
              .then(() => {
                response.pushedItem = true;
                response.addToWhishlist = true;
                resolve(response);
              });
          }
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .insertOne({
              user: userId,
              products: [proId],
            })
            .then((e) => {
              console.log();
              response.addToWhishlist = true;
              resolve(response);
            });
        }
      } else {
        response.existInCart = true;
        resolve(response);
      }
    });
  },
};
