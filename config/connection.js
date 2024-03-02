const { MongoClient } = require('mongodb');

const state = {
    db: null
};

module.exports.connect = function(callback) {
    const url = "mongodb://localhost:27017";
    const dbname = 'BuildLink';
    const client = new MongoClient(url);

    client.connect()
        .then(() => {
            //console.log("Connected successfully to MongoDB");
            state.db = client.db(dbname);
            if (callback) {
                callback(null); // Call the callback with no error
            }
        })
        .catch(err => {
            //console.error("Error connecting to MongoDB:", err);
            if (callback) {
                callback(err); // Call the callback with the error
            }
        });
};

module.exports.get = function() {
    return state.db;
};
