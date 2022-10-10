const verifyLogin = (req, res, next) => {
    if (req.session.vendor) next();
    else res.redirect('/vendor/signIn')
}

module.exports = { verifyLogin };