var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')


var objectId=require('mongodb').ObjectId


const Razorpay = require('razorpay');
const { resolve } = require('path');

var instance = new Razorpay({
  key_id: 'rzp_test_wjyI5JaGbTkmrC',
  key_secret: 'yAkWQLNSiKtETnp0a2I4HyVO',
});

module.exports={

    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId)
            })
            
            })
        },
        doLogin:(userData)=>{
            return new Promise(async(resolve,reject)=>{
                let loginStatus=false
                let response={}
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
                if(user){

                  bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)

                    }else{
                        console.log("login failed")
                        resolve({status:false})
                    }
                 })
            
                }else{
                console.log('login failed')
                resolve({status:false})
               }
            })
        },
        addtocart:(proId,userId)=>{
            let proObj={
                item:objectId(proId),
                quantity:1
            }
            return new Promise(async(resolve,reject)=>{
                let usercart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(usercart){
                let proExist=usercart.chart.findIndex(product=> product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                 db.get().collection(collection.CART_COLLECTION)
                 .updateOne({user:objectId(userId),'chart.item':objectId(proId)},
                 {
                    $inc:{'chart.$.quantity':1}
                 }
                 ).then(()=>{
                    resolve()
                 })
                }else{
             db.get().collection(collection.CART_COLLECTION)
             .updateOne({user:objectId(userId)},
             {
                
                    $push:{chart:proObj}
                
             }
             ).then((response)=>{
                resolve()
             })
                }
            }else{
                let cartObj={
                    user:objectId(userId),
                    chart:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
            })
        },
        getcartproducts:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let cartItem=await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user:objectId(userId)}
                    },
                    {
                        $unwind:'$chart'
                    },
                    {
                     $project:{
                         item:'$chart.item',
                         quantity:'$chart.quantity'
                     }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }
                    
                  
                          
                ]).toArray()
            
                resolve(cartItem)
            })
        },
        getcartcount:(userId)=>{
            let count=0
            return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           if(cart){
             count=cart.chart.length
           } 
           resolve(count)
        })
        },
        changeProductQuantity:(details)=>{
            details.count=parseInt(details.count)
            details.quantity=parseInt(details.quantity)

            return new Promise((resolve,reject)=>{
                if(details.count==-1 && details.quantity==1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart)},
                     {
                        $pull:{chart:{Item:objectId(details.product)}}
                     }
                    ).then((response)=>{
                        resolve({removeProduct:true})
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart),'chart.item':objectId(details.product)},
                {
                   $inc:{'chart.$.quantity':details.count}
                }
                ).then((response)=>{
                   resolve({status:true})
                })
                }   
            })
        },
        gettotalamount:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user:objectId(userId)}
                    },
                    {
                        $unwind:'$chart'
                    },
                    {
                     $project:{
                         item:'$chart.item',
                         quantity:'$chart.quantity'
                     }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}//this is used to to add the product amount  to cart
                        }
                    }
                    
                  
                          
                ]).toArray()
                  console.log(total[0].total)
                resolve(total[0].total)
            })    
        },
        placeOrder:(order,chart,total)=>{
            return new Promise((resolve,reject)=>{
           console.log(order,chart,total)
           let status=order['payment-method']==='COD'?'placed':'pending'
           let orderObj={
            deliveryDetails:{
            mobile:order.mobile,
            address:order.address,
            pincode:order.pincode
            },
            userId:objectId(order.userId),
            paymentMethod:order['payment-method'],
            chart:chart,
            totalAmount:total,
            status:status
            
        }
           db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            console.log("order Id:",response.insertedId)
            console.log("order id:",response.insertedId)
            resolve(response.insertedId)
           })
        })
        },
        getCartProductList:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                console.log(userId);
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
                console.log(cart)
                resolve(cart.chart)
            })
        },
        getuserorders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).toArray()
        console.log(orders)
        resolve(orders)
        })
    },
    getorderproducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$chart'
                },
                {
                 $project:{
                     item:'$chart.item',
                     quantity:'$chart.quantity'
                 }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
                
              
                      
            ]).toArray()
              console.log(orderItems)
            resolve(orderItems)
        })    
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
          var options = { //this point to
            amount: total*100,
            currency:"INR",
            receipt: ""+orderId
          };
          instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err)
            }else{
            console.log("new order :",order);
            resolve(order) // this point you can copy the code from introduction of razorepay
            } 
          });   
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
        const crypto=require('crypto')
        let hmac = crypto.createHmac('sha256','yAkWQLNSiKtETnp0a2I4HyVO')
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){
            resolve()
        }else{
            reject()
        }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                 $set:{
                    status:'placed'
                 }
            }
            ).then(()=>{
                resolve()
            })
        })
    }

}