var db = require('../config/connection')
var collection= require('../config/collections')
const bcrypt=require('bcrypt')
var ObjectId = require('mongodb').ObjectId

module.exports={
    doSignup:(userData)=>{
        //console.log(userData)
        return new Promise(async(resolve,reject)=>{

            //to check if already existing email
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(!user){
                userData.password =await bcrypt.hash(userData.password,10)
                //await db.connect();
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    //console.log(userData)
                    let userDetail = {}
                    userDetail.name=userData.fullname
                    userDetail.userId=userData._id
                    response.user=userDetail
                    response.status=true
                    console.log("Signup success")
                    resolve(response)
                })
            }else{
                console.log("Signup failed")
                resolve({status:false})
            }
        })
    },

    doLogin:(userData)=>{
        //console.log(userData)
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        let userDetail = {}
                        userDetail.name=user.fullname
                        userDetail.userId=user._id
                        response.user=userDetail
                        response.status=true
                        console.log("Login success")
                        resolve(response)
                    }else{
                        console.log("Login failed")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("Login failed")
                resolve({status:false})
            }
        })
    },

    getServices: () => {
        return new Promise(async (resolve, reject) => {
            let services = await db.get().collection(collection.SERVICE_COLLECTION).find().toArray()
            resolve(services)
        })
    },

    addToCart: (user, service) => {
      //console.log(user)
      //console.log(service)
      let serviceObj = {
          serviceType: service.serviceType,
          serviceName: service.serviceName,
          quantity: parseInt(service.quantity)
      }
      //console.log(serviceObj)
      return new Promise(async (resolve, reject) => {
          try {
              let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(user.userId) })
              if (userCart) {
                  let serviceExist = userCart.services.findIndex(item => item.serviceName == service.serviceName && item.serviceType == service.serviceType)
                  if (serviceExist != -1) {
                      await db.get().collection(collection.CART_COLLECTION).updateOne(
                          { user: new ObjectId(user.userId), 'services.serviceName': service.serviceName, 'services.serviceType': service.serviceType },
                          { $inc: { 'services.$.quantity': serviceObj.quantity } }
                      )
                      resolve()
                  } else {
                      await db.get().collection(collection.CART_COLLECTION).updateOne(
                          { user: new ObjectId(user.userId) },
                          { $push: { services: serviceObj } }
                      )
                      resolve()
                  }
              } else {
                  let cartObj = {
                      user: new ObjectId(user.userId),
                      services: [serviceObj]
                  }
                  await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj)
                  resolve()
              }
          } catch (error) {
              reject(error)
          }
      })
  },

  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
      resolve(cart);
    });
  },

    editCart: (userId, serviceName, quantity) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CART_COLLECTION).updateOne(
                    { user: new ObjectId(userId), 'services.serviceName': serviceName },
                    { $set: { 'services.$.quantity': parseInt(quantity) } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    deleteFromCart: (userId, serviceName) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CART_COLLECTION).updateOne(
                    { user: new ObjectId(userId) },
                    { $pull: { services: { serviceName: serviceName } } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    postServices: (userId, district, location, cart) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Iterate through each service in cart and create service request
                for (const service of cart.services) {
                    let serviceRequest = {
                        userId: new ObjectId(userId),
                        serviceType: service.serviceType,
                        serviceName: service.serviceName,
                        quantity: service.quantity,
                        district: district,
                        location: location,
                        status: 'pending' // or any initial status
                    };

                    await db.get().collection(collection.SERVICE_REQUESTS_COLLECTION).insertOne(serviceRequest);
                }

                // Clear user's cart after posting services
                await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new ObjectId(userId) });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}