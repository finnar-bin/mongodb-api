var mongoose = require('mongoose');

//tell mongoose to use built in promise lib
mongoose.Promise = global.Promise;

//connect to db
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
    mongoose
};