const couponHelpers = require('../helpers/coupon-helpers')



//@disc Get All Coupons
//@api GET /admin/coupon
//@access protected
const getCoupons = async (req, res) => {
    if (req.session.admin) {
        const coupons = await couponHelpers.getAllCoupon()
        res.render('admin/coupon', { adminTemplate: true, coupons })
    } else {
        res.redirect('/admin/')
    }
}

//@disc Add Coupon
//@api POST /admin/addCoupon
//@access protected
const addCoupon = (req, res) => {
    couponHelpers.addCoupon(req.body).then(() => {
      res.redirect('/admin/coupon')
    })
  }

//@disc Delete Coupon
//@api GET /admin/deleteCoupon/:id
//@access protected
const deleteCoupon = (req, res) => {
    couponHelpers.deleteCoupon(req.params.id).then(() => {
      res.redirect('/admin/coupon')
    })
  }

//@disc Edit Coupon 
//@api POST /admin/editCoupon/:id
//@access protected
const editCoupon = (req, res) => {
    couponHelpers.editCoupon(req.params.id, req.body).then(() => {
      res.redirect('/admin/coupon')
    })
  }


module.exports = {
    getCoupons,
    addCoupon,
    deleteCoupon,
    editCoupon
}