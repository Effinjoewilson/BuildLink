var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var ObjectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (agentData) => {
        //console.log(agentData)
        return new Promise(async (resolve, reject) => {

            //to check if already existing email
            let response = {}
            let agent = await db.get().collection(collection.AGENT_COLLECTION).findOne({ email: agentData.email })
            if (!agent) {
                agentData.password = await bcrypt.hash(agentData.password, 10)
                //await db.connect();
                db.get().collection(collection.AGENT_COLLECTION).insertOne(agentData).then((data) => {
                    //console.log(data)
                    console.log("Signup success")
                    let agentDetail = {}
                    agentDetail.agentId = data.insertedId
                    agentDetail.name = agentData.fullname
                    response.agent = agentDetail
                    response.status = true
                    resolve(response)
                })
            } else {
                console.log("signup failed")
                resolve({ status: false })
            }
        })
    },

    doLogin: (agentData) => {
        //console.log(agentData)
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let agent = await db.get().collection(collection.AGENT_COLLECTION).findOne({ email: agentData.email })
            if (agent) {
                bcrypt.compare(agentData.password, agent.password).then((status) => {
                    if (status) {
                        console.log("Login success")
                        let agentDetail = {}
                        agentDetail.agentId = agent._id
                        agentDetail.name = agent.fullname
                        response.agent = agentDetail
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login failed")
                resolve({ status: false })
            }
        })
    },

    addServices: (services, agentId) => {
        //console.log(services);
        return new Promise(async(resolve, reject) => {
            let agentService = await db.get().collection(collection.AGENT_SERVICES_COLLECTION).findOne({ agent: new ObjectId(agentId) });
            if (!agentService) {
                let agentObj = {
                    agent: new ObjectId(agentId),
                    services: Array.isArray(services) ? services : [services] // Ensure services is an array
                };
                db.get().collection(collection.AGENT_SERVICES_COLLECTION).insertOne(agentObj).then((response) => {
                    resolve();
                });
            } else {
                //console.log("Already Existing");
                // Update the existing agent service with the new services
                db.get().collection(collection.AGENT_SERVICES_COLLECTION).updateOne(
                    { agent: new ObjectId(agentId) },
                    { $push: { services: { $each: Array.isArray(services) ? services : [services] } } }
                ).then((response) => {
                    resolve();
                });
            }
        });
    },

    doTakeAgentServices: (agentId) => {
        return new Promise(async(resolve, reject) => {
            try {
                let agentServices = await db.get().collection(collection.AGENT_SERVICES_COLLECTION).findOne({ agent: new ObjectId(agentId) });
                //console.log(JSON.stringify(agentServices));
                resolve(agentServices);
            } catch (error) {
                reject(error);
            }
        });
    },

    getAgentProfile: (agentId) => {
        return new Promise(async (resolve, reject) => {
            let agent={}
            try {
                let agentDetails = await db.get().collection(collection.AGENT_COLLECTION).findOne({ _id: new ObjectId(agentId) });
                //agent.fullname=agentDetails.fullname
                //agent.email=agentDetails.email
                resolve(agentDetails);
            } catch (error) {
                reject(error);
            }
        });
    },

    updateAgentProfile: (agentId, profileData) => {
        return new Promise(async (resolve, reject) => {
          try {
            let updateData = {
              phone: profileData.phone,
              companyName: profileData.companyName,
              address: profileData.address,
              state: profileData.state,
              district: profileData.district
            };
            if (profileData.verificationImage) {
              updateData.verificationImage = `/verification-files/${agentId}.jpg`;
            }
            await db.get().collection(collection.AGENT_COLLECTION).updateOne(
              { _id: new ObjectId(agentId) },
              { $set: updateData }
            );
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    }
}