const productHelpers = require('../helpers/product-helpers')
const cartHelper = require('../helpers/cart-helpers')
const wishHelpers = require('../helpers/wish-helpers')
const categoryHelpers = require('../helpers/category-helpers')

//@disc Get Products 
//@api GET /admin/products
//@access protected
const getProducts = (req, res) => {
  categoryHelpers.getAllCategories().then((categories) => {
    productHelpers.getProduct().then(products => {
      res.render('admin/products', { adminTemplate: true, categories, products })
    })
  })
}

//@disc Add Product
//@api POST /admin/addProduct
//@access protected
const addProduct = (req, res) => {
  const images = []
  for (i = 0; i < req.files.length; i++) {
    images[i] = req.files[i].filename
  }
  req.body.Images = images
  req.body.date = Date.now();
  productHelpers.addProduct(req.body).then((id) => {
    res.redirect('/admin/products')
  })
}

//@disc Edit Product
//@api POST /admin/editProduct/:id
//@access protected
const editProduct = (req, res) => {
  productHelpers.editProduct(req.params.id, req.body, req.files).then(response => {
    res.redirect('/admin/products')
  })
}

//@disc Delete Product
//@api GET /admin/deleteProduct/:id
//@access protected
const deleteProduct = (req, res, next) => {
  try {
    cartHelper.deleteCartFromAllUsers(req.params.id);
    wishHelpers.removeFromAllWhishlist(req.params.id)
    productHelpers.deleteProduct(req.params.id).then(respond => {
      res.redirect('/admin/products')
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
}

module.exports = {
  addProduct,
  deleteProduct,
  editProduct,
  getProducts
}