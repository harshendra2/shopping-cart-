
var express = require('express');
const { render, response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const producthelper = require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers')
/* GET home page. */
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
router.get('/',async function(req, res, next) {
  var user=req.session.user
  console.log(user);
  let cartcount=null//1
  if(req.session.user){//2
  
   cartcount=await userHelpers.getcartcount(req.session.user._id)// 3 this 1 line used to cart count and show to home page
  }//line 1,2,3 are used to user front page show code
  producthelper.getAllchart().then((chart)=>{

   
  
    res.render('partial/user/view-products',{chart,user,cartcount});
    
    })
  });
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{

  
   res.render('partial/user/login',{"loginErr":req.session.userLoginErr})
   req.session.userLoginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('partial/user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
  
      req.session.user=response
      req.session.user.loggedIn=true
    res.redirect('/')//this line used to when login page next which page go
  })

})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
  
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/')//this page is used to login page next which page go
    }else{
      req.session.userLoginErr="Invalid username os password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{ //1
  req.session.user=null//2
  req.session.userLoggedIn=false
  res.redirect('/') //this 3 line 1,2,3, is used to logout button
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let chart=await userHelpers.getcartproducts(req.session.user._id)
   let totalValue=0
  if(chart.length>0){
    let totalValue=await userHelpers.gettotalamount(req.session.user._id)  
  }

  console.log(chart);
  res.render('partial/user/cart',{chart,user:req.session.user._id,totalValue})//this inside the flower braket cart is used to send the information to cart
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
 userHelpers.addtocart(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
 })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
  response.total=await userHelpers.gettotalamount(req.body.user)
   res.json(response)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.gettotalamount(req.session.user._id)
res.render('partial/user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let chart=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.gettotalamount(req.body.userId)
  userHelpers.placeOrder(req.body,chart,totalPrice).then((orderId)=>{
    console.log(orderId);
    if(req.body['payment-method']=='COD'){
  res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)

      })
    }
  })
  console.log(req.body)
})
router.get('/order-success',(req,res)=>{
  res.render('partial/user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getuserorders(req.session.user._id)
  res.render('partial/user/orders',{user:req.session.user,orders})
})
router.get('/view-order-product/:id',async(req,res)=>{
  let chart=await userHelpers.getorderproducts(req.params.id)
  res.render('partial/user/view-order-product',{user:req.session.user,chart})
})
router.post('/verify-payment',(req,res)=>{ //this line are used to razorpay orderId and payment id and signature  send to server
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment successfull")
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
})
router.get('/orders',(req,res)=>{
  res.render('partial/user/orders')
})


module.exports = router;
