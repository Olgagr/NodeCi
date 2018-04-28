jest.setTimeout(7000); // by default jest sets this for 5 seconds

require("./../models/User");
const keys = require("./../config/keys");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });
