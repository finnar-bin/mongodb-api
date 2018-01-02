const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose'); 
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5a4b1f64af2360c41ee6de19';

//check if ID is valid or not
if (!ObjectID.isValid(id)) {
    console.log('ID not valid');
}
// Todo.find({
//     _id : id
// }).then((todos) => {
//     console.log(`Todos: ${todos}`);
// });

// Todo.findOne({
//     _id : id
// }).then((todo) => {
//     console.log(`Todo ${todo}`);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found.');
//     };
//     console.log(`Todo by id: ${todo}`);
// }).catch((e) => {
//     console.log(e);
// });

User.findById(id).then((res) => {
    if (!res) {
        return console.log('ID not found');
    };
    console.log(`User found: ${res}`);
}).catch((e) => console.log(e));