const adminHelpers = require('../helpers/admin-helpers');


module.exports = {
    doSignIn: (req, res, next)=>{
      try {
        adminHelpers.doSignIn(req.body).then((admin)=>{
            req.session.admin = admin;
            res.redirect('/admin')
          }).catch(()=>{
            req.session.invalid = true;
            res.redirect('/admin')
          })
      } catch {console.log(error);
        next()
      }
    },
   
}