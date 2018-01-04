var mongoose = require('mongoose');

//tell mongoose to use built in promise lib
mongoose.Promise = global.Promise;

//connect to db
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
    mongoose
};