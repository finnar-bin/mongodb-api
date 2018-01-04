const mongoose = require('mongoose');
const validator = require('validator');

//user -> email -> required, trimmed, string, minlength = 1
var User = mongoose.model('User', {
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