const vendorHelpers = require('../helpers/vendor-helpers')


async function checkIsVendorBlocked(req, res, next) {
    const vendor = await vendorHelpers.getDetails(req.session.vendor._id)
    if (vendor.block) {
        req.session.vendorBlocked = true;
        res.redirect('/')
    } else {
        next()
    }

}


module.exports = { checkIsVendorBlocked }