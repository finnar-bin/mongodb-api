const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    // remove the entire array that matches the query below
    return user.update({
        $pull : {
            tokens : {token}
        }
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

    //return decoded;
    return User.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject()
        }

        return new Promise((resolve, reject) => {
            // bycrpyt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

// hash user password before saving it to the db
UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                // set hashed password as the password to be saved on to DB
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

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