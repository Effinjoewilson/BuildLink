var db = require('../config/connection')
var collection= require('../config/collections')
const bcrypt=require('bcrypt')

module.exports={
    doSignup:(agentData)=>{
        //console.log(agentData)
        return new Promise(async(resolve,reject)=>{

            //to check if already existing email
            let response={}
            let agent= await db.get().collection(collection.AGENT_COLLECTION).findOne({email:agentData.email})
            if(!agent){
                agentData.password =await bcrypt.hash(agentData.password,10)
                //await db.connect();
                db.get().collection(collection.AGENT_COLLECTION).insertOne(agentData).then((data)=>{
                    //console.log(agentData)
                    console.log("Signup success")
                    response.agent=agentData.fullname
                    response.status=true
                    resolve(response)
                })
            }else{
                console.log("signup failed")
                resolve({status:false})
            }
        })
    },

    doLogin:(agentData)=>{
        //console.log(agentData)
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let agent= await db.get().collection(collection.AGENT_COLLECTION).findOne({email:agentData.email})
            if(agent){
                bcrypt.compare(agentData.password,agent.password).then((status)=>{
                    if(status){
                        console.log("Login success")
                        response.agent=agent.fullname
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
    }
}