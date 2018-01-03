const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose'); 
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//removes everything
//Todo.remove({}).then((result) => console.log(result));

//remove 1 and get the data of the removed doc
//Todo.findOneAndRemove({_id : '5a4c701dc20595a4d22027ff'}).then((todo) => console.log(todo))

Todo.findByIdAndRemove('5a4c701dc20595a4d22027ff').then((todo) => console.log(todo));