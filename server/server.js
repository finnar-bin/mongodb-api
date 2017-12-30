var mongoose = require('mongoose');

//tell mongoose to use built in promise lib
mongoose.Promise = global.Promise;

//connect to db
mongoose.connect('mongodb://localhost:27017/TodoApp');

//create model for the db
var Todo = mongoose.model('Todo', {
    text : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },
    completed : {
        type : Boolean,
        default : false
    },
    completedAt : {
        type : Number,
        default : null
    }
});

// var newTodo = new Todo({
//     text : 'Edit a new video',
// });

// newTodo.save().then((succ) => {
//     console.log(`Saved Todo: ${succ}`);
// }, (err) => {
//     console.log(`Unable to save Todo: ${err}`);
// });

//user -> email -> required, trimmed, string, minlength = 1
var User = mongoose.model('User', {
    email : {
        type : String,
        required : true,
        trim : true,
        minlength : 1
    }
});

var newUser = new User({
    email : 'narc.ph@gmail.com'
});

newUser.save().then((s) => {
    console.log(`Registered new user: ${s}`);
}, (e) => {
    console.log(`Error registering user: ${e}`);
});