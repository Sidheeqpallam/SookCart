const categoryHelpers = require('../helpers/category-helpers')
const fs = require('fs')

//@disc Get Categories
//@api GET /admin/categories
//@access protected
const getCategories = (req, res) => {
    categoryHelpers.getAllCategories().then((categories) => {
        if (req.session.categoryExist) {
            res.render('admin/categories', { existPopUp: true, categories, categoriesActive: true, adminTemplate: true })
            req.session.categoryExist = false
        } else {
            res.render('admin/categories', { categories, adminTemplate: true, categoriesActive: true })
        }
    })
}


//@disc Add Category
//@api POST /admin/addCategory
//@access protected
const addCategory = (req, res) => {
    req.body.Image = req.file.filename;
    console.log(req.body);
    categoryHelpers.checkExist(req.body).then(() => {
        categoryHelpers.addCategory(req.body).then(() => {
            res.redirect('/admin/categories')
        })
    }).catch((category) => {
        req.session.categoryExist = true;
        res.redirect('/admin/categories')
    })
}

//@disc Edit Category
//@api POST /admin/editCategory/:id
//@access protected
const editCategory = (req, res) => {   // not completed
    categoryHelpers.editCategory(req.params.id, req.body).then(response => {
        res.redirect('/admin/categories')
    })
}

//@disc Delete Category 
//@api GET /admin/deleteCategory/:id
//@access protected
const deleteCategory = (req, res) => {
    categoryHelpers.deleteCategory(req.params.id).then(e => {
        res.redirect('/admin/categories')
    })
}

module.exports = {
    getCategories,
    addCategory,
    editCategory,
    deleteCategory

}