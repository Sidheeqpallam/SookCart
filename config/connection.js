const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const state = {
  db: null,
};

module.exports.connect = (done) => {
  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;

  MongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = () => {
  return state.db;
};
