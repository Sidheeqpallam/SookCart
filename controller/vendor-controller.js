const vendorHelpers = require('../helpers/vendor-helpers')
const authOtp = require('../authentication/otpVerify');
const userHelpers = require('../helpers/user-helpers');

//@disc Home Page
//@api GET /vendor
//@access Protected
const home = (req, res) => {
  if (req.session.vendor) {
    if (req.session.vendor.block) {
      res.render("vendor/signIn", { status: req.session });
      req.session.destroy();

    } else {
      res.render("vendor/index", { vendor_nav: true });
    }

  } else if (req.session.vendorNotFound || req.session.invalidPassword) {
    res.render("vendor/signIn", { status: req.session });
    req.session.destroy();
  } else {
    res.render('vendor/signIn');
  }
}

//@disc Signup vendor
//@api POST /vendor/signUp
//@access Public
const doSignUp = (req, res) => {
  vendorHelpers.checkVendorExist(req.body).then(() => {
    res.redirect('/vendor/otpVerification')
  }).catch(() => {
    req.session.accExist = true;
    res.redirect("/vendor/signUp");
  });
}

//@disc Sign In
//@api POST /vendor/signIn
//access Public
const doSignIn = (req, res) => {
  vendorHelpers.doSignIn(req.body).then((vendor) => {
    req.session.vendor = vendor.vendor;
    res.redirect("/vendor/");
  }).catch((status) => {
    if (status.vendorNotFound) {
      req.session.vendorNotFound = true;
      res.redirect('/vendor/')
    } else if (status.invalidPassword) {
      req.session.invalidPassword = true;
      res.redirect('/vendor/')
    }
  })
}


//@disc Sign In With Using OTP
//@api POST /vendor/signInWithOtp
//@access Public
const signInWithOtp = (req, res) => {
  vendorHelpers.checkVendorExist(req.body).then(() => {
    req.session.vendorNotFound = true;
    res.redirect('vendor/signIn')
  }).catch((vendorData) => {
    req.session.tempVendorData = vendorData;
    res.redirect('vendor/otpVerification')
  })
}


//@disc OTP Verification
//@api POST /vendor/otpVerification
//@access Public
const otpVerification = async (req, res) => {
  const status = await authOtp.checkOtp(req.body.otp, req.session.tempVendorData.MobileNo)
  if (status == 'approved') {
    if (req.session.signUp) {
      vendorHelpers.doSignUp(req.session.tempVendorData).then((response) => {
        req.session.vendor = req.session.tempVendorData;
        res.redirect('/vendor/')
      })
    } else if (req.session.signIn) {
      userHelpers.getDetailsUsingMobileNo(req.session.tempVendorData.MobileNo).then((vendorData) => {
        req.session.vendor = vendorData;
        res.redirect('/vendor/')
      })
    }
  } else {
    req.session.wrongOtp = true;
    res.redirect('/otpVerification');
  }
}

//@disc Signup page
//@api GET /vendor/signUp
//@access Public
const signUpPage = (req, res) => {
  if (req.session.vendor) {
    res.redirect("/vendor/");
  } else if (req.session.accExist) {
    res.render("vendor/signUp", { session: true });
    req.session.destroy();
  } else {
    res.render("vendor/signUp");
  }
}

//@disc OTP verification Page
//@api GET /vendor/otpVerification
//@access Public
const otpVerificationPage = (req, res) => {
  if (req.session.vendor) {
    res.redirect('/vendor/')
  } else if (req.session.wrongOtp) {
    res.render('vendor/otpVerification', { session: 'Wrong OTP!' })
  }
  authOtp.getOtp(req.session.tempVendorData.MobileNo).then(() => {
  })
  res.render('vendor/otpVerification')
}

//@disc Logout
//@api GET /vendor/logout
//@access Public
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/vendor/')
}

module.exports = {
  doSignUp,
  doSignIn,
  signInWithOtp,
  home,
  signUpPage,
  otpVerification,
  otpVerificationPage,
  logout
}