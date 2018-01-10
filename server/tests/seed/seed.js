const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

//seeder
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const seederUsers = [{
    _id : userOneId,
    email : 'testemail@example.com',
    password : 'password12345',
    tokens : [{
        access : 'auth',
        token : jwt.sign({
            _id : userOneId,
            access : 'auth'
        }, 'abc123').toString()
    }]
}, {
    _id : userTwoId,
    email : 'tes@gen.com',
    password : 'password12345',
    tokens : [{
        access : 'auth',
        token : jwt.sign({
            _id : userTwoId,
            access : 'auth'
        }, 'abc123').toString()
    }]
}];

const seederTodos = [{
    _id : new ObjectID(),
    text : 'First test',
    _creator : userOneId
}, {
    _id : new ObjectID(),
    text : 'Second test',
    completed : true,
    completedAt : 52525,
    _creator : userTwoId
}];

//used to make preparations before test is run
//remove all entries in db before running test below
const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(seederTodos);
    }).then(() => {
        done();
    });
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(seederUsers[0]).save();
        var userTwo = new User(seederUsers[1]).save();

        // takes array of promises, then waits for promises to be resolved
        return Promise.all([userOne, userTwo]);
    }).then(() => {
        done();
    });
};

module.exports = {
    seederTodos,
    populateTodos,
    seederUsers,
    populateUsers
};