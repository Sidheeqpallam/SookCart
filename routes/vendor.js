var express = require("express");
const vendorHelpers = require("../helpers/vendor-helpers");
var router = express.Router();
const session = require("express-session");
const {
  doSignIn,
  doSignUp,
  signInWithOtp,
  home,
  otpVerificationPage,
  logout,
  otpVerification,
  signUpPage
} = require('../controller/vendor-controller');
const authOtp = require('../authentication/otpVerify')
const { checkIsVendorBlocked } = require('../middleware/vendor-check-block')
const { verifyLogin } = require('../middleware/vendor-auth')



router.get("/", verifyLogin,  home);

router.get("/signUp", signUpPage);

router.post("/signUp", (req, res) => {
  req.body.Email = req.body.Email.toLowerCase();
  req.session.tempVendorData = req.body;
  req.session.signUp = true;
  req.session.signIn = false;
  doSignUp(req, res)
});


router.get('/otpVerification', otpVerificationPage)

router.post('/otpVerification', otpVerification)





router.post("/signIn", doSignIn);


router.post('/signInWithOtp', (req, res) => {
  req.session.signIn = true;
  req.session.signUp = false;
  signInWithOtp(req, res)
})






















router.get('/logout', logout)

module.exports = router;
