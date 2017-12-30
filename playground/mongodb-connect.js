//const MongoClient = require('mongodb').MongoClient;

const {MongoClient, ObjectID} = require('mongodb');

// var user = {name : 'nar cuenca', age : 25};
// var {name} = user;
// console.log(name);

//url, callback
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server.');
    }
    console.log('Connected to MongoDB server.');

    //create new collection with new entry
    // db.collection('Todos').insertOne({
    //     text : 'Something to do',
    //     completed : false
    // }, (err, res) => {
    //     if (err) {
    //         return console.error('Unable to insert todo', err);
    //     }

    //     //show recently inserted data inside ops
    //     console.log(JSON.stringify(res.ops, undefined, 2));
    // });

    //insert new doc into users collection -> name, age, location
    db.collection('Users').insertOne({
        name : 'Nar Cuenca',
        age : 27,
        location : 'Las Pinas City'
    }, (err, res) => {
        if (err) {
            return console.error('Unable to insert user:', err);
        }

        console.log(res.ops[0]._id.getTimestamp());
    });

    //close db connection
    db.close();
});