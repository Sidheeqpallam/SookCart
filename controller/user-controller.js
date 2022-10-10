const userHelpers = require("../helpers/user-helpers");
const authOtp = require('../authentication/otpVerify');
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const bannerHelpers = require('../helpers/banner-helpers')
const wishlistHelpers = require('../helpers/wish-helpers')
const cartHelpers = require('../helpers/cart-helpers');
const couponHelpers = require('../helpers/coupon-helpers')
const orderHelpers = require('../helpers/order-helpers')


//@disc Home 
//@api GET /
//@access Public
const home = async (req, res) => {
  const banner = await bannerHelpers.getBanner();
  const products = await productHelpers.getProduct();
  const categories = await categoryHelpers.getAllCategories();
  if (req.session.user) {
    const cartCount = await cartHelpers.getCartCount(req.session.user._id);
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    if (cartCount[0]) {
      res.render("user/index", {
        user_nav: true,
        user: req.session.user,
        userTemplate: true,
        banner,
        products,
        categories,
        index: true,
        cartCount: cartCount[0].count,
        wishCount: wishCount.products.length
      });
    } else {
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
}

//@disc Signup Page 
//@api GET /signUp
//@access Public
const signUpPage = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/signUp", {
      userExist: req.session.userExist,
      userTemplate: true,
    });
    req.session.destroy();
  }
}

//@disc Sign Up
//@api POST /signUp
//@access Public
const doSignUp = (req, res) => {
  req.body.Email = req.body.Email.toLowerCase();
  userHelpers.checkUserExist(req.body).then(() => {
    res.redirect("/otpVerification");
  })
    .catch(() => {
      req.session.userExist = true;
      res.redirect("/signUp");
    });
}

//@disc Sign Up 
//@api POST /signUp
//@access Public
const signUp = (req, res) => {
  req.session.tempUserData = req.body;
  req.session.signUp = true;
  req.session.signIn = false;
  doSignUp(req, res);
}

//@disc Sign In Page
//@api GET /signIn
//@access Public
const signInPage = (req, res) => {
  if (req.session.userBlocked) {
    req.session.userBlocked = false
    res.render('user/signIn', { blocked: true, userTemplate: true })
  } else if (req.session.user) {
    res.redirect("/");
  } else if (req.session.userNotFound || req.session.invalidPassword) {
    res.render("user/signIn", { status: req.session, userTemplate: true });
    req.session.destroy();
  } else {
    res.render("user/signIn", { userTemplate: true });
  }
}

//@disc Do Sign In
//@api POST /signIn
//@access Public
const doSignIn = (req, res) => {
  userHelpers.doSignIn(req.body).then((response) => {
    req.session.user = response.user;
    res.redirect("/");
  })
    .catch((status) => {
      if (status.userNotFound) {
        req.session.userNotFound = true;
        res.redirect("/signIn");
      } else {
        req.session.invalidPassword = true;
        res.redirect("/signIn");
      }
    });
}

//@disc OTP Page
//@api GET /otpVerification
//@access Public
const otpPage = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else if (req.session.wrongOtp) {
    res.render("user/otpVerification", {
      session: "Wrong OTP",
      userTemplate: true,
    });
  } else {
    authOtp.getOtp(req.session.tempUserData.MobileNo).then(() => { });
    res.render("user/otpVerification", { userTemplate: true });
  }
}


//@disc Do Sign In With OTP
//@api POST /signInWithOtp
//@access Public
const doSignInWithOtp = (req, res) => {
  userHelpers.checkUserExist(req.body).then((status) => {
    req.session.userNotFound = true;
    res.redirect('/signIn')
  }).catch((exist) => {

    req.session.tempUserData = req.body;
    req.session.signUp = false;
    req.session.signIn = true;
    res.redirect('/otpVerification')
  })
}

//@disc OTP Verification
//@api POST /otpVerification
//@access Public
const otpVerification = (req, res) => {
  authOtp.checkOtp(req.body.otp, req.session.tempUserData.MobileNo).then((status) => {
    if (status == 'approved') {
      if (req.session.signUp) {
        userHelpers.doSignUp(req.session.tempUserData).then((response) => {
          req.session.user = req.session.tempUserData;
          req.session.user._id = response.insertedId;
          res.redirect('/')
        })
      } else if (req.session.signIn) {
        userHelpers.getDetailsUsingMobileNo(req.session.tempUserData.MobileNo).then((userData) => {
          req.session.user = userData;
          res.redirect('/')
        })
      }

    } else {
      req.session.wrongOtp = true;
      res.redirect('/otpVerification');
    }
  })
}

//@disc View Products
//@api GET /products
//@access Public
const getProducts = async (req, res) => {
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
}

//@disc Selecting Category
//@api GET /products/:category
//@access Public
const selectCategory = (req, res) => {
  req.session.category = req.params.category;
  res.redirect("/categoryProducts");
}

//@disc View Products Category Wise
//@api GET /categoryProducts
//@access Public
const categoryWiseProducts = async (req, res) => {
  const categories = await categoryHelpers.getAllCategories();
  if (req.session.user) {
    const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
    const cartCount = await cartHelpers.getCartCount(req.session.user._id);
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
}

//@disc Contact Page
//@api GET /contact
//@access Public
const contactPage = (req, res) => {
  res.render("user/contact", {
    user_nav: true,
    userTemplate: true,
    contact: true,
  });
}

//@disc Sent Message
//@api POST /sentMessage
//@access Public
const sentMessage = (req, res) => {

}

//@disc User Details
//@api GET /userDetails
//@access Protected
const userDetails = async (req, res) => {
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
}

//@disc Get Cart
//@api GET /cart
//@access Protected
const getCart = async (req, res, next) => {
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
}

//@disc Add To Cart
//@api POST /addToCart/:id
//@access Protected in front end
const addToCart = (req, res) => {
  try {
    cartHelpers.addToCart(req.body.user, req.params.id).then(async (count) => {
      const cartCount = await cartHelpers.getCartCount(req.body.user);
      res.json({ count: count, cartCount: cartCount });
    });
  } catch (error) {
    console.log(error);
  }

}

//@disc Delete Cart Item
//@api GET /deleteCartItem/:proId
//@access Protected in front end
const deleteCartItem = (req, res) => {
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

}

//@disc Change Cart Quantity
//@api POST /changeCartQuantity
//@access Protected 
const changeCartQuantity = (req, res, next) => {
  cartHelpers.changeQuantity(req.body).then((response) => {
    cartHelpers.getTotalAmount(req.body.user).then((total) => {
      response.total = total;
      res.json({ response });
    });
  });
}

//@disc Check Coupon is Valid or not
//@api GET /couponCheck/:id
//@access Protected
const checkCoupon = (req, res) => {
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
}

//@disc Check out
//@api GET /checkout
//@access Protected in front end
const checkout = async (req, res) => {
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
}

//@disc Place Order
//@api POST /placeOrder
//@access Protected
const placeOrder = (req, res) => {

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
}

//@disc Order Success
//@api GET /orderSuccess/:orderId
//@access Protected
const orderSuccess = (req, res) => {
  req.session.orderId = req.params.orderId;
  if (req.session.coupon) {
    couponHelpers.couponUsing(req.session.user._id, req.session.coupon._id)
  }
  res.redirect("/orderSuccess");
}

const orderSuccessRes = (req, res) => {
  orderHelpers.getAnOrder(req.session.orderId).then((order) => {
    orderHelpers
      .changePaymentStatus(req.session.orderId)
      .then(() => {
        console.log(order);
        cartHelpers.deleteCartByUserId(order.user).then(() => {
          userHelpers.getAddress(req.session.user._id).then(async (address) => {
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
}

//@disc Get Orders 
//@api GET /orders
//@access Protected
const getOrders = async (req, res) => {
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
}

//@disc Get Invoice
//@api GET /invoice
//@access Protected
const Invoice = (req, res) => {
  req.session.invoiceId = req.params.id;
  res.redirect('/invoice')
}

const getInvoice = async (req, res) => {
  const order = await orderHelpers.getAnOrder(req.session.invoiceId)
  const address = await userHelpers.getAddress(req.session.user._id)
  let subTotal = 0;
  let total = 0;
  for (i of order.cart) {
    subTotal = subTotal + (i.product.quantity * i.productDetails.DiscountPrice);
    total = total + i.totalAmount
  }
  res.render('user/invoice', {
    user: req.session.user,
    userTemplate: true,
    Order: order,//make the variable's first letter capital for avoid the active attribute of nav item order
    total,
    subTotal,
    coupon: order.coupon,
    address: address.Address[order.addressIndex]
  })
}

//@disc Verification of Payment
//@api POST /verifyPayment
//@access Protected
const verifyPayment = (req, res) => {
  cartHelpers.verifyPayment(req.body).then(() => {
    res.json({ status: true });
  });
}

//@disc Add Address
//@api POST /addAddress
//@access Protected 
const addAddress = (req, res) => {
  userHelpers.addAdress(req.body, req.session.user._id).then(() => {
    res.redirect("/checkout");
  });
}

//@disc Get Wish List 
//@api GET /wishlist
//@access Protected
const getWishlist = async (req, res) => {
  const cartCount = await cartHelpers.getCartCount(req.session.user._id);
  const categories = await categoryHelpers.getAllCategories();
  const wishCount = await wishlistHelpers.getWhishCount(req.session.user._id)
  wishlistHelpers.getWhishlistProducts(req.session.user._id).then(list => {
    res.render('user/wishlist', {
      userTemplate: true,
      user_nav: true,
      categories: categories,
      cartCount: cartCount[0].count,
      user: req.session.user,
      wishlist: list,
      wishCount
    })
  })
}

//@disc Add To Wish List 
//@api GET /addWishList/:id
//@access Protected
const addToWishList = (req, res) => {
  wishlistHelpers
    .addToWhishlist(req.params.id, req.session.user._id)
    .then((response) => {
      //wish list is in pending. It will completed after full work of cart and payment.
      console.log(response);
      res.json({response})
    });
}

//@disc Delete From Wish
//@api GET /dileteFromWish/:id
//@access Protected
const deleteFromWish = (req, res)=>{
  wishlistHelpers.removeFromWhishlist(req.params.id, req.session.user._id).then(response =>{
    res.json({response})
  })
}

//@disc Subscribe
//@api POST /subscribe
//@access Public
const subscibe = (req, res)=>{
  subscribeHelpers.addToSubsciption(req.body).then(()=>{
    res.redirect('/')
  })
}

//@disc Logout
//@api GET /logout
//@access Public
const logout =  (req, res) => {
  req.session.destroy();
  res.redirect("/");
}

//@disc CodeZilla
//@api GET /codeZilla
//@access Public
const codezilla = (req, res) => {
  res.render("codeZilla");
}




module.exports = {
  signInPage,
  signUp,
  otpPage,
  signUpPage,
  home,
  doSignIn,
  doSignInWithOtp,
  otpVerification,
  getProducts,
  selectCategory,
  categoryWiseProducts,
  sentMessage,
  userDetails,
  contactPage,
  getCart,
  addToCart,
  deleteCartItem,
  changeCartQuantity,
  checkCoupon,
  checkout,
  placeOrder,
  orderSuccess,
  orderSuccessRes,
  getOrders,
  Invoice,
  getInvoice,
  verifyPayment,
  addAddress,
  getWishlist,
  addToWishList,
  deleteFromWish,
  subscibe,
  logout,
  codezilla
}