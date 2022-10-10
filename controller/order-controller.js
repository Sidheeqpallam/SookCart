const orderHelpers = require('../helpers/order-helpers')
const userHelpers = require('../helpers/user-helpers')


//@disc Get Orders
//@api GET /admin/orders
//@access protected
const getAllOrders = (req, res) => {
    orderHelpers.getAllOrders().then(async (orders) => {
        for (i of orders) {
            i.userDetails = await userHelpers.getDetails(i.user)
            let total = 0;
            for (j of i.cart) {
                total = total + j.totalAmount
            }
            i.total = total;
        }
        res.render('admin/orders', { adminTemplate: true, orders })
    })
}

//@disc Change Order Status
//@api POST /admin/changeOrderStatus
//@access protected
const changeOrderStatus = (req, res) => {
    orderHelpers.changeOrderStatus(req.body.orderId, req.body.status).then(() => {
        res.json({ response: 'status changed' })
    })
}


module.exports = {
    changeOrderStatus,
    getAllOrders,

}