const vendorHelpers = require('../helpers/vendor-helpers')
const authOtp = require('../authentication/otpVerify');
const userHelpers = require('../helpers/user-helpers');
// vendorHelpers.getDetails(data.insertedId).then((vendorData) => {
//     req.session.vendor = vendorData;
//     res.redirect("/vendor/");
//   });

module.exports = {
    doSignUp: (req, res)=>{
        vendorHelpers.checkVendorExist(req.body).then(()=>{
            
            res.redirect('/vendor/otpVerification')
        }).catch(() => {
      req.session.accExist = true;
      res.redirect("/vendor/signUp");
    });
    
    
    },
    doSignIn: (req, res)=>{
        vendorHelpers.doSignIn(req.body).then((vendor) => {
            req.session.vendor = vendor.vendor;
            res.redirect("/vendor/");
          }).catch((status)=>{
            if(status.vendorNotFound){
              req.session.vendorNotFound = true;
              res.redirect('/vendor/')
            }else if(status.invalidPassword){
              req.session.invalidPassword = true;
              res.redirect('/vendor/')
            }
          })
    },

    signInWithOtp: (req, res)=>{
        vendorHelpers.checkVendorExist(req.body).then(()=>{
          req.session.vendorNotFound = true;
          res.redirect('vendor/signIn')
        }).catch((vendorData)=>{
            req.session.tempVendorData = vendorData;
            res.redirect('vendor/otpVerification')
        })
    },




    otpVerification: (req, res) => {
        authOtp.checkOtp(req.body.otp, req.session.tempVendorData.MobileNo).then((status) => {
          if (status == 'approved') { 
            if (req.session.signUp) {
              vendorHelpers.doSignUp(req.session.tempVendorData).then((response)=>{
              req.session.vendor = req.session.tempVendorData;
              res.redirect('/vendor/')
            })
            } else if(req.session.signIn) {
              userHelpers.getDetailsUsingMobileNo(req.session.tempVendorData.MobileNo).then((vendorData)=>{
                req.session.vendor = vendorData;
                res.redirect('/vendor/')
              })
            }
    
          } else {
            req.session.wrongOtp = true;
            res.redirect('/otpVerification');
          }
        })
      }
     
}