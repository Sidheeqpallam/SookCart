const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const orderHelpers = require('../helpers/order-helpers')
const productHelpers = require('../helpers/product-helpers')


//@disc Sign in of Admin
//@api POST admin/signIn
//@access Public
const doSignIn = (req, res, next) => {
  try {
    adminHelpers.doSignIn(req.body).then((admin) => {
      req.session.admin = admin;
      res.redirect('/admin')
    }).catch(() => {
      req.session.invalid = true;
      res.redirect('/admin')
    })
  } catch {
    console.log(error);
    next()
  }
}



//@disc Home page of Admin
//@api GET admin/
//@access Protacted
const dashboardDatas = async () => {
  let totalSaleAmount = 0;
  let totalSaleToday = 0;

  const allOrder = await orderHelpers.getAllOrders();
  for (i of allOrder) {
    for (j of i.cart) {
      totalSaleAmount = totalSaleAmount + j.totalAmount;
    }
  }
  // split date and time
  const now = new Date()
  const today = now.toLocaleDateString('en-GB');
  for (i of allOrder) {
    if (i.date == today) {
      for (j of i.cart) {
        totalSaleToday = totalSaleToday + j.totalAmount;
      }
    }
  }
  let recentOrders = allOrder.slice(-5)


  for (i of recentOrders) {
    i.userDetails = await userHelpers.getDetails(i.user)
    let total = 0;
    for (j of i.cart) {
      total = total + j.totalAmount
    }
    i.total = total;
  }

  recentOrders = recentOrders.reverse();
  return {
    totalSaleAmount, totalSaleToday, totalProfit: Math.round(totalSaleAmount / 3.3),
    totalProfitToday: Math.round(totalSaleToday / 3.3), recentOrders
  }

}
const home = async (req, res) => {
  if (req.session.admin) {
    const data = await dashboardDatas();
    res.render('admin/index', { dashboard: true, title: 'Admin', adminTemplate: true, data });
  } else if (req.session.invalid) {
    res.render('admin/signIn', { adminTemplate: true, invalid: true })
    req.session.invalid = false;
  } else {
    res.render('admin/signIn', { adminTemplate: true })

  }
}

//@disc Get Sale & Product Dates for Charting
//@api /admin/chartData
//@access Protected 
const salesReport = () => {
  return orderHelpers.getDayWiseTotalSalesAmount()
}
const productReport = async () => {
  const categoryWiseProduct = await productHelpers.categoryWiseProductQty()
  const categoryWiseSales = await orderHelpers.categoryWiseSaleQty()
  return { product: categoryWiseProduct, sales: categoryWiseSales }
}

const getChartingData = async (req, res) => {
  let sales = await salesReport()
  sales = sales.slice(-7);
  let products = await productReport()
  res.json({ sale: sales, product: products })
}


//@disc Get Sale & Product Dates for Charting
//@api /admin/getSalesReport
//@access Protected 
const getSalesReport = (req, res) => {
  orderHelpers.getSaleReport().then(report => {
    res.json(report)
  })
}

//@disc Get Users 
//@api /admin/users
//@access Protect
const getUsers = (req, res) => {
  if (req.session.admin) {
    userHelpers.getUsers().then((users) => {
      res.render('admin/users', { users, adminTemplate: true })
    })
  } else {
    res.redirect('/admin/')
  }
}

//@disc Edit User Details
//@api POST /admin/editUser/:id
//@access Protect
const editUser = (req, res) => {
  userHelpers.editUser(req.params.id, req.body).then((response) => {
    res.redirect('/admin/users')
  })
}

//@disc Block User
//@api GET /admin/blockUser/:id
//@access Protect
const blockUser = (req, res) => {
  userHelpers.blockUser(req.params.id).then((data) => {
    res.redirect('/admin/users')
  })
}

//@disc Unblock User
//@api GET /admin/unblockUser/:id
//@access Protect
const unBlockUser = (req, res) => {
  userHelpers.unBlockUser(req.params.id).then((data) => {
    res.redirect('/admin/users')
  })
}

//@disc Delete User
//@api GET /admin/deleteUser/:id
//@access Protect
const deleteUser = (req, res) => {
  userHelpers.deleteUser(req.params.id).then((data) => {
    res.redirect('/admin/users')
  })
}

//@disc Get Vendors
//@api GET /admin/vendors
//@access Protect
const getVendors = (req, res) => {
  if (req.session.admin) {
    vendorHelpers.getVendors().then((vendors) => {
      res.render('admin/vendors', { vendors, adminTemplate: true })
    })
  } else {
    res.redirect('/admin/')
  }
}

//@disc Edit Vendors
//@api POST /admin/vendorEdit/:id
//@access Protect
const editVendor = (req, res) => {
  vendorHelpers.editVendor(req).then((response) => {
    res.redirect('/admin/vendors')
  })
}

//@disc Delete Vendor
//@api GET /admin/deleteVendor/:id
//@access Protect
const deleteVendor = (req, res) => {
  vendorHelpers.deleteVendor(req.params.id).then((data) => {
    res.redirect('/admin/vendors')
  })
}

//@disc Block Vendor
//@api GET /admin/blockVendor/:id
//@access Protect
const blockVendor = (req, res) => {
  vendorHelpers.blockVendor(req.params.id).then((data) => {
    res.redirect('/admin/vendors')
  })
}

//@disc Unblock Vendor
//@api GET /admin/unBlockVendor/:id
//@access Protect
const unBlockVendor = (req, res) => {
  vendorHelpers.unBlockVendor(req.params.id).then((data) => {
    res.redirect('/admin/vendors')
  })
}

//@disc Logout of Admin
//@api GET /admin/logout
//@access Public
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/')
}

module.exports = {
  doSignIn,
  home,
  getChartingData,
  getSalesReport,
  editUser,
  blockUser,
  unBlockUser,
  getUsers,
  deleteUser,
  getVendors,
  editVendor,
  deleteVendor,
  blockVendor,
  unBlockVendor,


  logout
}
