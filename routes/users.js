var express = require("express");
var router = express.Router();
const session = require("express-session");
const { verifyLogin } = require('../middleware/user-auth')
const {
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
  userDetails,
  categoryWiseProducts,
  sentMessage,
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
 } = require('../controller/user-controller')


// ============ Home =================== //
router.get("/", home);
router.get("/signUp", signUpPage);
router.post("/signUp", signUp);
router.get("/signIn", signInPage);
router.post("/signIn", doSignIn);
router.get("/otpVerification", otpPage);
router.post("/signInWithOtp", doSignInWithOtp);
router.post("/otpVerification", otpVerification);
// ====================== PRODUCTS =========================== //
router.get("/products", getProducts);
router.get("/products/:category", selectCategory);
router.get("/categoryProducts", categoryWiseProducts);
// =============== message ========= //
router.get("/contact", contactPage);
router.post('/sentMessage', sentMessage)
//============ USER DETAILS ========================= //
router.get("/userDetails", verifyLogin, userDetails);
// ======================= Cart ================================= //
router.get("/cart", getCart);
router.post("/addToCart/:id", addToCart);
router.get("/deleteCartItem/:proId", deleteCartItem);
router.post("/changeCartQuantity", verifyLogin, changeCartQuantity);
// =========================== COUPON ========================= ///
router.get("/couponCheck/:code", verifyLogin, checkCoupon);
// ========================= PAYMENT ================================= //
router.get("/checkout", checkout);
router.post("/placeOrder", verifyLogin, placeOrder);
router.get("/orderSuccess/:orderId", orderSuccess);
router.get("/orderSuccess", verifyLogin, orderSuccessRes);
router.get("/orders", verifyLogin, getOrders);
router.get('/invoice/:id', verifyLogin, Invoice)
router.get('/invoice', verifyLogin, getInvoice)
router.post("/verifyPayment", verifyPayment);
// =================== ADDRESS =========================== //
router.post("/addAddress", verifyLogin, addAddress);
// ============================ WISH LIST ======================== //
router.get('/wishlist', verifyLogin, getWishlist)
router.get("/addToWishList/:id", verifyLogin, addToWishList);
router.get('/deleteFromWish/:id', verifyLogin, deleteFromWish)
// ================ SUBSCIBE =============== //
router.post('/subscibe', subscibe)
//============  LOG OUT ================ //
router.get("/logout", logout);
router.get("/codeZilla", codezilla);

module.exports = router;
