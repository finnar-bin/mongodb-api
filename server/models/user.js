const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        minlength : 1,
        unique : true,
        validate : {
            validator : validator.isEmail,
            message : '{VALUE} is not a valid email'
        }
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    tokens : [{
        access : {
            type : String,
            required : true
        },
        token : {
            type : String,
            required : true
        }
    }]
});

//overide method below -> determine what gets sent back when mongoose model gets converted to a JSON value
UserSchema.methods.toJSON = function () {
    var user = this;
    //converts to mongoose variable to a regular object
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

//created a custom method
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id : user._id.toHexString(),
        access
    }, 'abc123').toString();

    //push new variables to tokens array
    user.tokens = user.tokens.concat([{access, token}]);
    //user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        return Promise.reject();
    };

    return User.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
};

// User model config
var User = mongoose.model('User', UserSchema);

module.exports = {
    User
};

// var newUser = new User({
//     email : 'test@email.com'
// });

// newUser.save().then((s) => {
//     console.log(`Registered new user: ${s}`);
// }, (e) => {
//     console.log(`Error registering user: ${e}`);
// });