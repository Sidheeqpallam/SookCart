const bannerHelpers = require('../helpers/banner-helpers')



module.exports = {
    addBanner : (req, res, next)=>{
        req.body.Image = req.file.filename;
        try {
        bannerHelpers.addBanner(req.body).then((id)=>{
            res.redirect('/admin/banner')
        })
        } catch (error){
            console.log(error);  
            next(error)     
        
        }
       
    },
    getBanner : (req, res, next)=>{
        try {
            bannerHelpers.getBanner().then(data =>{
                res.render('admin/banner', {adminTemplate: true, banner: data})
            })
        } catch (error){
            console.error(error)
            next(error)
        }
    },
    deleteBanner : (req, res, next)=>{
        try{
            bannerHelpers.deleteBanner(req.params.id).then(respond =>{
                res.redirect('/admin/banner')
            })
        } catch (error){
            console.error(error)
            next(error)
        }
    }
}