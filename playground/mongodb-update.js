const {MongoClient, ObjectID} = require('mongodb');

//url, callback
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server.');
    }
    console.log('Connected to MongoDB server.');

    // db.collection('Todos').findOneAndUpdate({
    //     _id : new ObjectID('5a470508b63e1e46cf2e0671')
    // }, {
    //     $set : {
    //         completed : true
    //     }
    // }, {
    //     //return the updated document
    //     returnOriginal : false
    // }).then((res) => {
    //     console.log(res);
    // });

    db.collection('Users').findOneAndUpdate({
        _id : new ObjectID('5a46f8eab54470140c954991')
    }, {
        $set : {
            name : 'Ruby Ann Sabugal'
        },
        $inc : {
            age : 1
        }
    }, {
        returnOriginal : false
    }).then((res) => {
        console.log(res);
    });

    //db.close();
});