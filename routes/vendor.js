var express = require("express");
const vendorHelpers = require("../helpers/vendor-helpers");
var router = express.Router();
const session = require("express-session");
const vendorController = require('../controller/vendor-controller');
const authOtp = require('../authentication/otpVerify')

function checkIsVendorBlocked (req){vendorHelpers.isBlocked(req.session.vendor).then((blocked)=>{
  req.session.vendorBlocked = true;
  res.redirect('/')
})}




router.get("/", function (req, res) {
  if (req.session.vendor) {
    if(req.session.vendor.block){
   res.render("vendor/signIn", {status: req.session});
    req.session.destroy();
      
    }else{
      res.render("vendor/index", {vendor_nav: true});
    }
    
  } else if(req.session.vendorNotFound || req.session.invalidPassword){
    res.render("vendor/signIn", {status: req.session});
    req.session.destroy();
  }else{
    res.render('vendor/signIn');
  }
});

router.get("/signUp", (req, res) => {
  if (req.session.vendor) {
    res.redirect("/vendor/");
  } else if (req.session.accExist) {
    res.render("vendor/signUp", { session: true });
    req.session.destroy();
  } else {
    res.render("vendor/signUp");
  }
});

router.post("/signUp", (req, res) => {
  req.body.Email = req.body.Email.toLowerCase();
  req.session.tempVendorData = req.body;
  req.session.signUp = true;
  req.session.signIn = false;
  vendorController.doSignUp(req, res)
});


router.get('/otpVerification', (req, res)=>{
  if(req.session.vendor){
    res.redirect('/vendor/')
  }else if(req.session.wrongOtp){
    res.render('vendor/otpVerification', {session: 'Wrong OTP!'})
  }
  authOtp.getOtp(req.session.tempVendorData.MobileNo).then(()=>{
  })
  res.render('vendor/otpVerification')
})

router.post('/otpVerification', vendorController.otpVerification)





router.post("/signIn", vendorController.doSignIn);


router.post('/signInWithOtp', (req, res)=>{
  req.session.signIn = true;
  req.session.signUp = false;
  vendorController.signInWithOtp(req, res)
})






















router.get('/logout', (req, res)=>{
  req.session.destroy();
  res.redirect('/vendor/')
})

module.exports = router;
