var express = require('express');
var router = express.Router();
const bannerController = require('../controller/banner-controller');
const upload = require('../config/multer');
const { verifyLogin } = require('../middleware/admin-auth')
const { doSignIn,
  editUser,
  blockUser,
  getSalesReport,
  unBlockUser,
  getUsers,
  deleteUser,
  getVendors,
  editVendor,
  deleteVendor,
  blockVendor,
  unBlockVendor,
  logout,
  getChartingData,
  home } = require('../controller/admin-controller');
const {
  getCategories,
  addCategory,
  editCategory,
  deleteCategory
} = require('../controller/category-controller')

const {
  deleteProduct,
  addProduct,
  getProducts,
  editProduct
} = require('../controller/product-controller')

const {
  changeOrderStatus,
  getAllOrders
} = require('../controller/order-controller')
const {
  getCoupons,
  addCoupon,
  deleteCoupon,
  editCoupon
} = require('../controller/coupon-controller')


//=========== GET ADMIN HOME ===================== //
router.get('/', home);
router.get('/getSalesReport', verifyLogin, getSalesReport)
router.get('/chartData', verifyLogin, getChartingData)
//  ======= SIGN IN ====================== //
router.post('/signIn', doSignIn)
// ================ USERS ================= //
router.get('/users', verifyLogin, getUsers)
router.post('/editUser/:id', verifyLogin, editUser)
router.get('/deleteUser/:id', verifyLogin, deleteUser)
router.get('/blockUser/:id', verifyLogin, blockUser)
router.get('/unblockUser/:id', verifyLogin, unBlockUser)
// ================= VENDORS ================== //
router.get('/vendors', verifyLogin, getVendors)
router.post('/vendorEdit/:id', verifyLogin, editVendor)
router.get('/deleteVendor/:id', verifyLogin, deleteVendor)
router.get('/blockVendor/:id', verifyLogin, blockVendor)
router.get('/unBlockVendor/:id', verifyLogin, unBlockVendor)
// ============= CATEGORIES ===================
router.get('/categories', verifyLogin, getCategories)
router.post('/addCategory', verifyLogin, upload.single('category'), addCategory)
router.post('/editCategory/:id', verifyLogin, editCategory)
router.get('/deleteCategory/:id', verifyLogin, deleteCategory)
// ======================== Products =================================
router.get('/products', verifyLogin, getProducts)
router.post('/addProduct', verifyLogin, upload.array('product', 8), addProduct)
router.get('/deleteProduct/:id', verifyLogin, deleteProduct)
router.post('/editProduct/:id', verifyLogin, upload.array('produt', 8), editProduct)
// ========================== Orders ======================================
router.get('/orders', verifyLogin, getAllOrders)
router.post('/changeOrderStatus', verifyLogin, changeOrderStatus)
// =========================== Banner =================================== //
router.get('/banner', verifyLogin, bannerController.getBanner)
router.post('/addBanner', verifyLogin, upload.single('banner'), bannerController.addBanner)
router.get('/deleteBanner/:id', verifyLogin, bannerController.deleteBanner)
// =========================== Coupon ====================================== //
router.get('/coupon', verifyLogin, getCoupons)
router.post('/addCoupon', verifyLogin, addCoupon)
router.get('/deleteCoupon/:id', verifyLogin, deleteCoupon)
router.post('/editCoupon/:id', verifyLogin, editCoupon)
// ==================== LOGOUT ===================
router.get('/logout', logout)

module.exports = router;