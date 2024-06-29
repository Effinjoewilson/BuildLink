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
  }

};
