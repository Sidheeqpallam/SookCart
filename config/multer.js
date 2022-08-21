
// multer uploader setup


const multer = require('multer')
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback)=>{
    const dir = './public/images/'  + file.fieldname;
    callback(null, dir)
  },
  filename: (req, file, cb)=>{
    cb(null, Date.now() + "--" + file.originalname);
  }
})


module.exports = multer({storage : fileStorageEngine})



