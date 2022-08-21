var express = require("express");
const app = express();
var router = express.Router();
const session = require("express-session");
const userHelpers = require("../helpers/user-helpers");
const authOtp = require("../authentication/otpVerify");
const userController = require("../controller/user-controller");
const bannerHelpers = require("../helpers/banner-helpers");
const productHelpers = require("../helpers/product-helpers");
const categoryHelpers = require("../helpers/category-helpers");
const cartHelpers = require("../helpers/cart-helpers");
const orderHelpers = require("../helpers/order-helpers");
const couponHelpers = require("../helpers/coupon-helpers");
const wishlistHelpers = require("../helpers/wish-helpers");
const subscribeHelpers = require('../helpers/subscibe-helpers')

// const isBlocked = function (req, res, next) {
//   if(req.session.user){
//      userHelpers.isBlocked(req.session.user).then((no) => {
//     next()
//   }).catch((yes)=>{
//     req.session.userBlocked = true;
//     res.redirect("/signIn");
//     console.log("user Blocked");
//   })
//   }else{
//     next()
//   }

// };
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

/* GET home page. */
router.get("/", async function (req, res) {
  const banner = await bannerHelpers.getBanner();
  const products = await productHelpers.getProduct();
  const categories = await categoryHelpers.getAllCategories();
  if (req.session.user) {
    const cartCount = await cartHelpers.getCartCount(req.session.user._id);
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    if(cartCount[0]){
      res.render("user/index", {
      user_nav: true,
      user: req.session.user,
      userTemplate: true,
      banner,
      products,
      categories,
      index: true,
      cartCount: cartCount[0].count,
      wishCount :wishCount.products.length
    });
    }else{
      res.render("user/index", {
      user_nav: true,
      user: req.session.user,
      userTemplate: true,
      banner,
      products,
      categories,
      index: true,
      cartCount: 0,
    });
    }
    
  } else {
    res.render("user/index", {
      user_nav: true,
      userTemplate: true,
      banner,
      products,
      categories,
      index: true,
    });
  }
});

router.get("/signUp", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/signUp", {
      userExist: req.session.userExist,
      userTemplate: true,
    });
    req.session.destroy();
  }
});

router.post("/signUp", (req, res) => {
  req.session.tempUserData = req.body;
  req.session.signUp = true;
  req.session.signIn = false;
  userController.doSignUp(req, res);
});

router.get("/signIn", (req, res) => {
  if(req.session.userBlocked){
    req.session.userBlocked = false
    res.render('user/signIn', {blocked: true, userTemplate:true})
  }else if (req.session.user) {
    res.redirect("/");
  } else if (req.session.userNotFound || req.session.invalidPassword) {
    res.render("user/signIn", { status: req.session, userTemplate: true });
    req.session.destroy();
  } else {
    res.render("user/signIn", { userTemplate: true });
  }
});

router.post("/signIn", userController.doSignIn);

router.get("/otpVerification", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else if (req.session.wrongOtp) {
    res.render("user/otpVerification", {
      session: "Wrong OTP",
      userTemplate: true,
    });
  } else {
    authOtp.getOtp(req.session.tempUserData.MobileNo).then(() => {});
    res.render("user/otpVerification", { userTemplate: true });
  }
});

router.post("/signInWithOtp", userController.doSignInWithOtp);

router.post("/otpVerification", userController.otpVerification);

// ====================== PRODUCTS =========================== //

router.get("/products", async (req, res) => {
  const categories = await categoryHelpers.getAllCategories();
  if (req.session.user) {
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    var cartCount = await cartHelpers.getCartCount(req.session.user._id);
    productHelpers.getProduct().then((products) => {
      res.render("user/products", {
        products,
        userTemplate: true,
        user_nav: true,
        categories,
        shop: true,
        user: req.session.user,
        cartCount: cartCount[0].count,
        wishCount
      });
    });
  } else {
    productHelpers.getProduct().then((products) => {
      res.render("user/products", {
        products,
        userTemplate: true,
        user_nav: true,
        categories,
        shop: true,
        user: req.session.user,
      });
    });
  }
});

router.get("/products/:category", (req, res) => {
  req.session.category = req.params.category;
  res.redirect("/categoryProducts");
});

router.get("/categoryProducts", async (req, res) => {
  const categories = await categoryHelpers.getAllCategories();
  if (req.session.user) {
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    var cartCount = await cartHelpers.getCartCount(req.session.user._id);
    productHelpers
      .getProductByCategory(req.session.category)
      .then((products) => {
        req.session.category = null;
        res.render("user/products", {
          products,
          userTemplate: true,
          user_nav: true,
          categories,
          shop: true,
          user: req.session.user,
          cartCount: cartCount[0].count,
          wishCount
        });
      });
  } else {
    productHelpers
      .getProductByCategory(req.session.category)
      .then((products) => {
        req.session.category = null;
        res.render("user/products", {
          products,
          userTemplate: true,
          user_nav: true,
          categories,
          shop: true,
          user: req.session.user,
        });
      });
  }
});


// =============== message ========= //
router.get("/contact", (req, res) => {
  res.render("user/contact", {
    user_nav: true,
    userTemplate: true,
    contact: true,   
  });
});

router.post('/sentMessage', (req, res)=>{

})

router.get("/userDetails", verifyLogin, async (req, res) => {
  const cartCount = await cartHelpers.getCartCount(req.session.user._id);
  const address = await userHelpers.getAddress(req.session.user._id);
  const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
  const categories = await categoryHelpers.getAllCategories();
  res.render("user/userDetails", {
    user: req.session.user,
    userTemplate: true,
    user_nav: true,
    cartCount: cartCount[0].count,
    address: address.Address,
    wishCount,
    categories
  });
});

// ======================= Cart ================================= //

router.get("/cart", async (req, res, next) => {
  if (req.session.user) {
    req.session.coupon = null;
    const subTotal = await cartHelpers.getTotalAmount(req.session.user._id);
    const cartCount = await cartHelpers.getCartCount(req.session.user._id);
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    cartHelpers.getCart(req.session.user._id).then((response) => {
      res.render("user/cart", {
        user: req.session.user,
        userTemplate: true,
        user_nav: true,
        cart: response,
        subTotal,
        cartCount: cartCount[0].count,
        wishCount
      });
    });
  } else {
    res.redirect("/signIn");
  }
});

router.post("/addToCart/:id", (req, res) => {
  try {
     cartHelpers.addToCart(req.body.user, req.params.id).then(async (count) => {
    const cartCount = await cartHelpers.getCartCount(req.body.user);
    res.json({ count: count, cartCount: cartCount });
  });
  } catch (error) {
    console.log(error);
  }
 
});

router.get("/deleteCartItem/:proId", (req, res) => {
  try {
     console.log(req.params);
  cartHelpers
    .deleteCart(req.session.user._id, req.params.proId)
    .then((response) => {
      res.json({ response });
    });
  } catch (error) {
    console.log(error);
  }
 
});

router.post("/changeCartQuantity", verifyLogin, (req, res, next) => {
  cartHelpers.changeQuantity(req.body).then((response) => {
    cartHelpers.getTotalAmount(req.body.user).then((total) => {
      response.total = total;
      res.json({ response });
    });
  });
});

// =========================== COUPON ========================= ///

router.get("/couponCheck/:code", verifyLogin, (req, res) => {
  couponHelpers
    .checkCoupon(req.params.code, req.session.user._id)
    .then((response) => {
      if (response) {
        if (response.status) {
          res.json({ used: response.status });
        } else {
          req.session.user.coupon = response;
          res.json({ response });
        }
      } else {
        res.json();
      }
    });
});

// ========================= PAYMENT ================================= //

router.get("/checkout", async (req, res) => {
  const total = await cartHelpers.getTotalAmount(req.session.user._id);
  const cart = await cartHelpers.getCart(req.session.user._id);
  const address = await userHelpers.getAddress(req.session.user._id);
  const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
  const cartCount = await cartHelpers.getCartCount(req.session.user._id);
  res.render("user/checkout", {
    user_nav: true,
    userTemplate: true,
    user: req.session.user,
    total,
    cart,
    address: address.Address,
    coupon: req.session.user.coupon,
    cartCount: cartCount[0].count,
    wishCount
  });
});

router.post("/placeOrder", (req, res) => {
  if (req.session.user) {
    cartHelpers.placeOrder(req.body, req.session.user).then((data) => {
      orderHelpers.getAnOrder(data.insertedId).then((order) => {
        if (req.body.paymentMethod == "COD") {

          res.json({ order });
        } else {
          cartHelpers.generateRazorpay(order).then((response) => {
            res.json({ order: response });
          });
        }
      });
    });
  } else {
    res.redirect("/signIn");
  }
});

router.get("/orderSuccess/:orderId", (req, res) => {
  req.session.orderId = req.params.orderId;
  if(req.session.coupon){
    couponHelpers.couponUsing(req.session.user._id, req.session.coupon._id)
  }
  res.redirect("/orderSuccess");
});

router.get("/orderSuccess", verifyLogin, (req, res) => {
  orderHelpers.getAnOrder(req.session.orderId).then((order) => {
    orderHelpers
      .changePaymentStatus(req.session.orderId)
      .then(() => {
        console.log(order);
        cartHelpers.deleteCartByUserId(order.user).then(() => {
          userHelpers.getAddress(req.session.user._id).then(async(address) => {
            const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
            res.render("user/order", {
              userTemplate: true,
              user_nav: true,
              user: req.session.user,
              order,
              address: address.Address[order.addressIndex],
              wishCount
            });
          });
        });
      })
      .catch(() => {
        res.json({ status: false });
      });
  });
});

router.get("/orders", verifyLogin, async (req, res) => {
  const cartCount = await cartHelpers.getCartCount(req.session.user._id);
  const address = await userHelpers.getAddress(req.session.user._id);
  const order = await orderHelpers.getOrdersWithUserId(req.session.user._id);
  const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
  res.render("user/orders", {
    userTemplate: true,
    user_nav: true,
    cartCount: cartCount[0].count,
    user: req.session.user,
    order,
    address: address.Address[0],
    wishCount
  });
});

router.post("/verifyPayment", (req, res) => {
  cartHelpers.verifyPayment(req.body).then(() => {
    res.json({ status: true });
  });
});

// =================== ADDRESS =========================== //

router.post("/addAddress", (req, res) => {
  userHelpers.addAdress(req.body, req.session.user._id).then(() => {
    res.redirect("/checkout");
  });
});

// ============================ WISH LIST ======================== //

router.get('/wishlist', verifyLogin, async(req, res)=>{
  const cartCount = await cartHelpers.getCartCount(req.session.user._id);
  const categories = await categoryHelpers.getAllCategories();  
  const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
  wishlistHelpers.getWhishlistProducts(req.session.user._id).then(list =>{
    res.render('user/wishlist', {
    userTemplate: true,
    user_nav: true,
    categories :categories,
    cartCount: cartCount[0].count,
    user: req.session.user,
    wishlist : list,
    wishCount
})
  })
  
})

router.get("/addToWishList/:id", verifyLogin, (req, res) => {
  wishlistHelpers
    .addToWhishlist(req.params.id, req.session.user._id)
    .then((response) => {
      //wish list is in pending. It will completed after full work of cart and payment.
      console.log(response);
      res.json({response})
    });
});

router.get('/deleteFromWish/:id', verifyLogin, (req, res)=>{
  console.log('delete from wish');
  wishlistHelpers.removeFromWhishlist(req.params.id, req.session.user._id).then(response =>{
    res.json({response})
  })
})




// ================ SUBSCIBE =============== //

router.post('/subscibe', (req, res)=>{
  subscribeHelpers.addToSubsciption(req.body).then(()=>{
    res.redirect('/')
  })
})




//============  LOG OUT ================ //

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/codeZilla", (req, res) => {
  res.render("codeZilla");
});

module.exports = router;
