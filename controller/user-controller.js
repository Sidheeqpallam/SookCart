const userHelpers = require("../helpers/user-helpers");
const authOtp = require('../authentication/otpVerify');
const { isBlocked } = require("../helpers/user-helpers");



module.exports = {
  doSignUp: (req, res) => {
    req.body.Email = req.body.Email.toLowerCase();
    userHelpers.checkUserExist(req.body).then(() => {
      res.redirect("/otpVerification");
    })
    
    
    .catch(() => {
      req.session.userExist = true;
      res.redirect("/signUp");
    });
},

doSignIn: (req, res) => {
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
  },
  doSignInWithOtp: (req, res)=>{
    userHelpers.checkUserExist(req.body).then((status)=>{
      req.session.userNotFound = true;
      res.redirect('/signIn')
    }).catch((exist)=>{
  
    req.session.tempUserData = req.body;
    req.session.signUp = false;
    req.session.signIn = true;
    res.redirect('/otpVerification')
    })
  },
  

  otpVerification: (req, res) => {
    authOtp.checkOtp(req.body.otp, req.session.tempUserData.MobileNo).then((status) => {
      if (status == 'approved') { 
        if (req.session.signUp) {
          userHelpers.doSignUp(req.session.tempUserData).then((response)=>{
          req.session.user = req.session.tempUserData;
          req.session.user._id = response.insertedId;
          res.redirect('/')
        })
        } else if(req.session.signIn) {
          userHelpers.getDetailsUsingMobileNo(req.session.tempUserData.MobileNo).then((userData)=>{
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
}
