var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true,products})
  });
  
});
router.get('/add-product',function(req,res) {
  res.render('admin/add-product')
})
router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);


  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    var path = require('path');

    var imagepath = path.join(__dirname, '../public/product-images', id + '.jpg');
    console.log("Saving image to " + imagepath);
    image.mv(imagepath, (err) => {
      if (err) {
        console.log('file upload error:', err);
        return res.status(500).send('File upload failed');
      }
      console.log("image successfully saved");
      res.render("admin/add-product");
    });
  });
});
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId);
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductsDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product});
})

router.post('/edit-product/:id',(req,res)=>{

  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let id=req.params.id
    if(req.files.Image)
      {
      var image=req.files.Image
      var path = require('path');
      var imagepath= path.join(__dirname,'../public/product-images'+id+'.jpg');  
      
        console.log("Saving image to"+imagepath);
        image.mv(imagepath)
         
        
      }
      res.redirect('/admin')
    })
})
module.exports = router;
