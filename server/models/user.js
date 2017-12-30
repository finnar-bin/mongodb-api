var mongoose = require('mongoose');

//user -> email -> required, trimmed, string, minlength = 1
var User = mongoose.model('User', {
    email : {
        type : String,
        required : true,
        trim : true,
        minlength : 1
    }
});

module.exports = {
    User
};

// var newUser = new User({
//     email : 'narc.ph@gmail.com'
// });

// newUser.save().then((s) => {
//     console.log(`Registered new user: ${s}`);
// }, (e) => {
//     console.log(`Error registering user: ${e}`);
// });