const userHelpers = require('../helpers/user-helpers')


const isBlocked =  (req, res, next) => {
  if (req.session.user) {
    userHelpers.isBlocked(req.session.user._id).then((no) => {
      next()
    }).catch((yes) => {
      req.session.user = null;
      req.session.userBlocked = true;
      res.redirect("/signIn");
    })
  } else {
    next()
  }
};

module.exports = { isBlocked }