const productHelpers = require('../helpers/product-helpers')
const cartHelper = require('../helpers/cart-helpers')
const wishHelpers = require('../helpers/wish-helpers')



module.exports = {
    addProduct :  (req, res)=>{
        const images = []
        for(i=0; i<req.files.length; i++){             
            images[i] = req.files[i].filename
        }
        req.body.Images = images
        req.body.date = Date.now();
        productHelpers.addProduct(req.body).then( (id) =>{
            res.redirect('/admin/products') 
        })
    },
    deleteProduct : (req, res, next)=>{
        try{
            cartHelper.deleteCartFromAllUsers(req.params.id);
            wishHelpers.removeFromAllWhishlist(req.params.id)
            productHelpers.deleteProduct(req.params.id).then(respond =>{
                res.redirect('/admin/products')
            })
        } catch (error){
            console.error(error)
            next(error)
        }
    }
}