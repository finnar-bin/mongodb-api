const {MongoClient, ObjectID} = require('mongodb');

//url, callback
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server.');
    }
    console.log('Connected to MongoDB server.');

    //fetch documents from mongodb and returns it as an array
    // db.collection('Todos').find({
    //     _id : new ObjectID('5a46fc0eb63e1e46cf2e0477')
    // }).toArray().then((docs) => {
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.error('Ubale to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.error('Unbale to fetch todos', err);
    // });

    db.collection('Users').find({
        name : 'Ruby Sabugal'
    }).toArray().then((res) => {
        console.log(JSON.stringify(res, undefined, 2));
    }, (err) => {
        console.log(`An error was encountered: ${err}`);
    });


    //db.close();
});