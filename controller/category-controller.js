const categoryHelpers = require('../helpers/category-helpers')
const fs = require('fs')


module.exports = {
    addCategory : (req, res)=>{
        req.body.Image = req.file.filename;
        console.log(req.body);
        categoryHelpers.checkExist(req.body).then(()=>{

            categoryHelpers.addCategory(req.body).then(()=>{
                res.redirect('/admin/categories')
            })
        }).catch((category)=>{

            req.session.categoryExist = true;
            res.redirect('/admin/categories')
        })
    },
    deleteCategory : (req, res)=>{
        categoryHelpers.deleteCategory(req.params.id).then(e =>{
            res.redirect('/admin/categories')
        })
    }
    
}