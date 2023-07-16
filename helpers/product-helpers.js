
var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId
module.exports={

    addproduct:(product,callback)=>{
       
        db.get().collection('product').insertOne(product).then((data)=>{
           console.log(data);
        
          
            callback(data.InsertedId)//insert id used to to recieve the image id in mongo bd to folders
         
        })
    },
    getAllchart:()=>{
        return new Promise(async(resolve,reject)=>{
            let chart=await db.get().$setcollection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(chart)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            console.log(prodId);
            console.log(objectId(prodId));
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                
                resolve(response)
            })
        })
    },
    getProductdetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Price:proDetails.Price,
                    categary:proDetails.categary,
                    description:proDetails.description
                }
            }).then((response)=>{
                resolve()
            })
                
            })
        
    }

    

}