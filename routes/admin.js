var express = require('express');
const app = express()
var router = express.Router();
const adminController = require('../controller/admin-controller');
const vendorHelpers = require('../helpers/vendor-helpers');
const userHelpers = require('../helpers/user-helpers');
const categoryController = require('../controller/category-controller');
const categoryHelpers = require('../helpers/category-helpers');
const bannerController = require('../controller/banner-controller');
const productHelpers = require('../helpers/product-helpers');
const productController = require('../controller/product-controller');
const upload = require('../config/multer');
const couponHelpers = require('../helpers/coupon-helpers');
const orderHelpers = require('../helpers/order-helpers');


const verifyLogin= (req, res, next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/')
  }
}


const dashboardDatas = async()=>{
  let totalSaleAmount = 0;
  let totalSaleToday = 0;

   const allOrder = await orderHelpers.getAllOrders();
   for(i of allOrder){
    for(j of i.cart){
      totalSaleAmount = totalSaleAmount + j.totalAmount;
    }
   }
   // split date and time
   const now = new Date()
   const today = now.toLocaleDateString();
   for(i of allOrder){
    if(i.date == today){
      for(j of i.cart){
        totalSaleToday = totalSaleToday + j.totalAmount;
      }
    }
   }
   let recentOrders = allOrder.slice(-5)


   for(i of recentOrders){
    i.userDetails = await userHelpers.getDetails(i.user)
    let total = 0;
    for(j of i.cart){
     total = total + j.totalAmount
    }
    i.total = total;
  }

  recentOrders = recentOrders.reverse();
   return {totalSaleAmount, totalSaleToday, totalProfit : Math.round(totalSaleAmount / 3.3) , 
   totalProfitToday : Math.round(totalSaleToday / 3.3), recentOrders }

}
//======== dash board data collection end =============

const salesReport = ()=>{
  return orderHelpers.getDayWiseTotalSalesAmount()
}

const productReport = async ()=>{
  const categoryWiseProduct = await productHelpers.categoryWiseProductQty()
  const categoryWiseSales = await orderHelpers.categoryWiseSaleQty()
  return {product :categoryWiseProduct, sales:  categoryWiseSales}
}


/* GET ADMIN HOME. */
router.get('/', async function(req, res) {
  if(req.session.admin){
    const data = await dashboardDatas();
    console.log(data, 'sdfs');
    res.render('admin/index' , {dashboard : true, title: 'Admin',adminTemplate: true, data});
  }else if (req.session.invalid) {
    res.render('admin/signIn', {adminTemplate : true, invalid : true})
    req.session.invalid = false;
  }else{
    res.render('admin/signIn', {adminTemplate: true})
  
  }
});


router.get('/chartData', async (req, res)=>{
  let sales = await salesReport()
   sales = sales.slice(-10);
  let products = await productReport()
  res.json({sale : sales, product: products})
})

//  ======= SIGN IN =============
router.post('/signIn', adminController.doSignIn)

// ================ USERS =================

router.get('/users', verifyLogin, (req, res)=>{
  console.log('users');
    if(req.session.admin){
      userHelpers.getUsers().then((users)=>{
        res.render('admin/users', { users,adminTemplate: true})
      })
    }else{
      res.redirect('/admin/')
    }
  })
  
  router.post('/editUser/:id',verifyLogin, (req, res)=>{
    userHelpers.editUser(req).then((response)=>{
      res.redirect('/admin/users')
    })
  })
  
  router.get('/deleteUser/:id', verifyLogin,(req, res)=>{
    userHelpers.deleteUser(req.params.id).then((data)=>{
      res.redirect('/admin/users')
    })
  })
  
  router.get('/blockUser/:id',verifyLogin, (req, res)=>{
    userHelpers.blockUser(req.params.id).then((data)=>{
      res.redirect('/admin/users')
    })
  })
  
  router.get('/unblockUser/:id', verifyLogin,(req, res)=>{
    userHelpers.unBlockUser(req.params.id).then((data)=>{
      res.redirect('/admin/users')
    })
  })
  
  




// ================= VENDORS ==================

router.get('/vendors', verifyLogin,(req, res)=>{

  if(req.session.admin){
    vendorHelpers.getVendors().then((vendors)=>{
      res.render('admin/vendors', { vendors,adminTemplate: true})
    })
  }else{
    res.redirect('/admin/')
  }
})

router.post('/vendorEdit/:id',verifyLogin, (req, res)=>{
  vendorHelpers.editVendor(req).then((response)=>{
    res.redirect('/admin/vendors')
  })
})

router.get('/deleteVendor/:id',verifyLogin, (req, res)=>{
  vendorHelpers.deleteVendor(req.params.id).then((data)=>{
    res.redirect('/admin/vendors')
  })
})

router.get('/blockVendor/:id',verifyLogin, (req, res)=>{
  vendorHelpers.blockVendor(req.params.id).then((data)=>{
    res.redirect('/admin/vendors')
  })
})

router.get('/unBlockVendor/:id', verifyLogin,(req, res)=>{
  vendorHelpers.unBlockVendor(req.params.id).then((data)=>{
    res.redirect('/admin/vendors')
  })
})

// ============= CATEGORIES ===================
router.get('/categories', verifyLogin,(req, res)=>{
  categoryHelpers.getAllCategories().then((categories)=>{
    if(req.session.categoryExist){
      res.render('admin/categories', { existPopUp: true, categories, categoriesActive : true, adminTemplate: true})
      req.session.categoryExist = false
  }else{
 res.render('admin/categories', { categories,adminTemplate: true, categoriesActive : true})
  }
  })
  

})

router.post('/addCategory',verifyLogin, upload.single('category'), categoryController.addCategory)

router.post('/editCategory/:id',verifyLogin, (req, res)=>{   // not completed
  categoryHelpers.editCategory(req.params.id, req.body).then(response =>{
    res.redirect('/admin/categories')
  })
})

router.get('/deleteCategory/:id',verifyLogin, categoryController.deleteCategory)



// ======================== Products =================================
router.get('/products', verifyLogin, (req, res)=>{
 categoryHelpers.getAllCategories().then((categories)=>{
  productHelpers.getProduct().then(products =>{
    res.render('admin/products', {adminTemplate: true, categories, products})
  })
  })
})

router.post('/addProduct',verifyLogin, upload.array('product', 8), productController.addProduct)

router.get('/deleteProduct/:id', verifyLogin,productController.deleteProduct)

router.post('/editProduct/:id',verifyLogin, upload.array('produt',8), (req, res)=>{
  productHelpers.editProduct(req.params.id, req.body, req.files).then(response=>{
    res.redirect('/admin/products')
  })
})


// ========================== Orders ======================================

router.get('/orders', verifyLogin, (req, res)=>{
  orderHelpers.getAllOrders().then(async (orders) =>{

    for(i of orders){
      i.userDetails = await userHelpers.getDetails(i.user)
      let total = 0;
      for(j of i.cart){
       total = total + j.totalAmount
      }
      i.total = total;
    }
    res.render('admin/orders', {adminTemplate : true, orders})
  })

 
})

router.post('/changeOrderStatus', verifyLogin,(req, res)=>{
  console.log(req.body);
  orderHelpers.changeOrderStatus(req.body.orderId, req.body.status).then(()=>{
    res.json({response: 'status changed'})
  })
})


// =========================== Banner ===================================

router.get('/banner' ,verifyLogin, bannerController.getBanner)

router.post('/addBanner', verifyLogin,upload.single('banner'), bannerController.addBanner)

router.get('/deleteBanner/:id',verifyLogin, bannerController.deleteBanner)





// =========================== Coupon ======================================


router.get('/coupon',verifyLogin, async(req, res)=>{
  if(req.session.admin){
    const coupons = await couponHelpers.getAllCoupon()
    res.render('admin/coupon', {adminTemplate: true, coupons})
  }else{
    res.redirect('/admin/')
  }
})


router.post('/addCoupon', verifyLogin,(req, res)=>{
  couponHelpers.addCoupon(req.body).then(() =>{
    res.redirect('/admin/coupon')
  })
})

router.get('/deleteCoupon/:id',verifyLogin, (req, res)=>{
  couponHelpers.deleteCoupon(req.params.id).then(()=>{
    res.redirect('/admin/coupon')
  })
})


router.post('/editCoupon/:id', verifyLogin, (req, res)=>{
  couponHelpers.editCoupon(req.params.id, req.body).then(()=>{
    res.redirect('/admin/coupon')
  })
})






router.get('/logout',(req, res)=>{
  req.session.destroy();
  res.redirect('/admin/')
})


module.exports = router, app;
