var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId

module.exports = {
  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email });
      if (!admin) {
        adminData.password = await bcrypt.hash(adminData.password, 10);
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
          console.log("Admin Signup success")
          response.admin = adminData.fullname;
          response.status = true;
          resolve(response);
        });
      } else {
        console.log("Admin Signup Failed - Already used email")
        resolve({ status: false });
      }
    });
  },

  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email });
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            console.log("Admin Login success")
            response.admin = admin.fullname;
            response.status = true;
            resolve(response);
          } else {
            console.log("Admin Login Failed")
            resolve({ status: false });
          }
        });
      } else {
        console.log("Admin Login Failed")
        resolve({ status: false });
      }
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
      resolve(users);
    });
  },

  getAllAgents: () => {
    return new Promise(async (resolve, reject) => {
      let agents = await db.get().collection(collection.AGENT_COLLECTION).find().toArray();
      resolve(agents);
    });
  },

  getUserCount: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db.get().collection(collection.USER_COLLECTION).countDocuments();
      resolve(count);
    });
  },

  getAgentCount: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db.get().collection(collection.AGENT_COLLECTION).countDocuments();
      resolve(count);
    });
  },

  getAllAgentsWithProfileImage: () => {
    return new Promise(async (resolve, reject) => {
      let agents = await db.get().collection(collection.AGENT_COLLECTION).find().toArray();
      resolve(agents.map(agent => ({
        ...agent,
        verificationImage: `/public/verification-files/${agent._id}.jpg`
      })));
    });
  },

  verifyAgent: (agentId) => {
    //console.log(agentId)
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.AGENT_COLLECTION).updateOne(
        { _id: new ObjectId(agentId) },
        { $set: { verified: true } }
      );
      resolve();
    });
  },

  rejectAgent: (agentId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.AGENT_COLLECTION).updateOne(
        { _id: new ObjectId(agentId) },
        { $set: { verified: false, rejected: true } }
      );
      resolve();
    });
  },

  getVerifiedAgentCount: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db.get().collection(collection.AGENT_COLLECTION).countDocuments({ verified: true });
      resolve(count);
    });
  },
  
  getUnverifiedAgentCount: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db.get().collection(collection.AGENT_COLLECTION).countDocuments({ verified: false, rejected: { $ne: true } });
      resolve(count);
    });
  },
  
  getAgentServices: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let agentServices = await db.get().collection(collection.AGENT_SERVICES_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.AGENT_COLLECTION,
                        localField: 'agent',
                        foreignField: '_id',
                        as: 'agentDetails'
                    }
                },
                {
                    $unwind: '$agentDetails'
                },
                {
                    $project: {
                        services: 1,
                        'agentDetails._id': 1,
                        'agentDetails.fullname': 1,
                        'agentDetails.email': 1,
                        'agentDetails.phone': 1
                    }
                }
            ]).toArray();
            resolve(agentServices);
        } catch (error) {
            reject(error);
        }
    });
  },
  
  acceptService: async (serviceData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { agentId, serviceType, serviceName } = serviceData;
  
        // Find if the service with the same name already exists
        let existingService = await db.get().collection(collection.SERVICE_COLLECTION).findOne({
          service_type: serviceType,
          "services.service_name": serviceName
        });
  
        if (existingService) {
          // If the service exists, append the agent ID to the existing service
          await db.get().collection(collection.SERVICE_COLLECTION).updateOne(
            {
              _id: existingService._id,
              "services.service_name": serviceName
            },
            {
              $addToSet: {
                "services.$.agents": new ObjectId(agentId)
              }
            }
          );
        } else {
          // Find if the service with the same service type already exists
          let existingServiceType = await db.get().collection(collection.SERVICE_COLLECTION).findOne({
            service_type: serviceType
          });
  
          if (existingServiceType) {
            // If the service type exists, add the new service to the existing services array
            await db.get().collection(collection.SERVICE_COLLECTION).updateOne(
              {
                _id: existingServiceType._id
              },
              {
                $push: {
                  services: {
                    service_name: serviceName,
                    agents: [new ObjectId(agentId)]
                  }
                }
              }
            );
          } else {
            // If the service type does not exist, create a new service entry
            let newService = {
              service_type: serviceType,
              services: [
                {
                  service_name: serviceName,
                  agents: [new ObjectId(agentId)]
                }
              ]
            };
            await db.get().collection(collection.SERVICE_COLLECTION).insertOne(newService);
          }
        }
  
        // Update the verified field to true in the agent services collection
        await db.get().collection(collection.AGENT_SERVICES_COLLECTION).updateMany(
          {
            agent: new ObjectId(agentId),
            "services.service_type": serviceType,
            "services.name": serviceName
          },
          {
            $set: {
              "services.$[elem].verified": true
            }
          },
          {
            arrayFilters: [
              { "elem.service_type": serviceType, "elem.name": serviceName }
            ]
          }
        );
  
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  
};
