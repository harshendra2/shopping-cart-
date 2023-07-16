var express = require('express');
const { render, response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  

  productHelper.getAllchart().then((chart)=>{

  console.log(chart);

  res.render('admin/view-products',{admin:true,chart});
  })
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product');

})
router.post('/add-product',(req,res)=>{
 
  productHelpers.addproduct(req.body,(id)=>{
  
   let Image=req.files.Image
   console.log(id);
   Image.mv('./public/product-images/'+id+'.jpg',(err)=>{//1
    if(!err){//2
      res.render("admin/add-product")//3
    }else{//4
      console.log(err);//this 1 to 4 lines are used to sende to image folder(product-image folder)
    }
   })
   })
    })
    router.get('/delete-product/:id',(req,res)=>{
      let proId=req.params.id
      console.log(proId);
      productHelpers.deleteProduct(proId).then((response)=>{
        res.redirect('/admin/')
      })

    })
    router.get('/edit-product/:id',async(req,res)=>{//1
      let product=await productHelpers.getProductdetails(req.params.id)//2
      console.log(product);//3
      res.render('admin/edit-product',{product})//4
    })

     router.post('/edit-product/:id',(req,res)=>{//5
      productHelpers.updateProduct(req.params.id,req.body).then(()=>{//6
        console.log(req.params.id);
        let id=req.params.id
        res.redirect('/admin')// 1 to 6 line code are  used to edite product and also update admine product detailse
        if(req.files.Image){
          let image=req.files.Image
          image.mv('./public/product-images/'+id+'.jpg')
              

        }
      })
     })
     router.get('/orders',(req,res)=>{
      res.render('partial/user/orders')
     })


module.exports = router;
