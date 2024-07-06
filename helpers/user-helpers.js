var db = require('../config/connection')
var collection= require('../config/collections')
const bcrypt=require('bcrypt')

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
                    console.log("Signup success")
                    response.user=userData.fullname
                    response.status=true
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
                        console.log("Login success")
                        response.user=user.fullname
                        response.status=true
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
    }
}