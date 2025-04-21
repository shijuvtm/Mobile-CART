var db=require('../config/connection')
var collection=require("../config/collection");
var Objectid  = require('mongodb').ObjectId
const {ObjectId}=require('mongodb');
const { response } = require('../app');
module.exports={
    addProduct:(product,callback)=>{
        console.log(product,callback);
        product.Price = parseInt(product.Price, 10);
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
            callback(data.insertedId);
        }).catch(err=>{
            console.error("database insert error:",err);
        });
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            console.log(proId);
           
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new Objectid(proId) }).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductsDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new Objectid(proId) }).then((product)=>{
                resolve(product)
            })
        })
    }, 
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new Objectid(proId)},{$set:{
                Name:proDetails.Name,
                Description:proDetails.Description,
                Price:proDetails.Price,
                Category:proDetails.Category


            }
        }).then((response)=>{
            resolve()
        })
        })
    }
}