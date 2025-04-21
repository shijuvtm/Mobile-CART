var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { request, response } = require("../app");
const { ObjectId } = require("mongodb");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userData.password) {
          return reject(new Error("Password is required"));
        }

        // Hash the password with salt rounds (10)
        userData.password = await bcrypt.hash(userData.password, 10);

        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data.insertedId);
          })
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, request) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },

  doadminLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus1 = false;
      let response1 = {};
      let admin1 = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ Email: userData.Email });
      if (admin1) {
        bcrypt.compare(userData.password, admin1.password).then((status1) => {
          if (status1) {
            console.log("login success");
            response1.admin1 = admin1;
            response1.status1 = true;
            resolve(response1);
          } else {
            console.log("login failed");
            resolve({ status1: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status1: false });
      }
    });
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: new ObjectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: new ObjectId(userId) });
        if (userCart) {
          let proExist = userCart.products.findIndex((product) =>
            product.item.equals(new ObjectId(proId))
          );
          if (proExist != -1) {
            // Increment the quantity of the existing product
            await db
              .get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: new ObjectId(userId), "products.item": new ObjectId(proId) },
                { $inc: { "products.$.quantity": 1 } }
              );
          } else {
            // Add the new product to the cart
            await db
              .get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: new ObjectId(userId) },
                { $push: { products: proObj } }
              );
          }
        } else {
          // Create a new cart for the user
          let cartObj = {
            user: new ObjectId(userId),
            products: [proObj],
          };
          await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj);
        }
        resolve();
      } catch (err) {
        console.error("Error in addToCart:", err);
        reject(err);
      }
    });
  },

  getcartProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
    
        let cartItems = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: new ObjectId(userId) },
            },
            {
                $unwind: "$products"
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
              $project:{
                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
              }
            }
           
          ])
          .toArray();
          
       
        resolve(cartItems);
       
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: new ObjectId(userId) });
        if (cart) {
          count = cart.products.length; // Count the number of products in the cart
        }
        resolve(count);
      } catch (err) {
        console.error("Error in getCartCount:", err);
        reject(err);
      }
    });
  },
  changeProductQuantity: (details) => {
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    return new Promise(async (resolve, reject) => {
          if(details.count==-1 && details.quantity==1){

          db.get().collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(details.cart)},
            {
              $pull:{products:{item:new ObjectId(details.product)}}
            }
        ).then((response)=>{

          resolve({removeProduct:true})
          
        })
      }
      else{
        db.get().collection(collection.CART_COLLECTION).updateOne({_id: new ObjectId(details.cart),'products.item':new ObjectId(details.product)},
          {
            $inc:{'products.$.quantity':details.count}
          }).then((response)=>{
            resolve({status:true})
          })
      }
            
    });
  },
  removeFromCart:(details)=>{
  
  return new Promise((resolve, reject) => {
    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new ObjectId(details.cart) },
        {
          $pull: { products: { item: new ObjectId(details.product) } },
        }
      )
      .then((response) => {
        resolve({ removeProduct: true });
      })
      .catch((err) => {
        console.error("Error in removeFromCart:", err);
        reject(err);
      });
  });
},

getTotalAmount:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
              $match: { user: new ObjectId(userId) },
            },
            {
                $unwind: "$products"
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField: 'item',
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
                total:{ $sum:{$multiply:['$quantity','$product.Price']}}
               }
             }
           
          ]).toArray();
          
        
        resolve(total[0].total);
       
    });
},
placeOrder:async(order,products,total)=>{

  return new Promise((resolve, reject) => {
    console.log(order,products,total);
    let status=order['Payment']==='COD'?'placed':'pending'
    let orderObj={
      deliveryDetails:{
        mobile:order.mobile,
        address:order.address,
        pincode:order.pincode
      },
      userId:new ObjectId(order.userId),
      paymentMethod:order['Payment'],
      products:products,
      totalAmount:total,
      status:status,
      date:new Date()
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{ 
      db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
      resolve({orderId:response.insertedId})
    })
  });
},
getCartProductList:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
    console.log(cart);
    resolve(cart.products)  
})
},
getUserOrders:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:new ObjectId(userId)}).toArray()
    console.log(orders);
    resolve(orders)
  })
},
getOrderProducts: (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: new ObjectId(orderId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray();
      console.log(orderItems);
      resolve(orderItems);
    } catch (err) {
      console.error("Error in getOrderProducts:", err);
      reject(err);
    }
  });
},

};