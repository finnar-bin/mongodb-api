const {MongoClient, ObjectID} = require('mongodb');

//url, callback
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server.');
    }
    console.log('Connected to MongoDB server.');

    //deleteMany
    // db.collection('Todos').deleteMany({
    //     text : 'Eat lunch'
    // }).then((res) => {
    //     console.log(res);
    // });

    //deleteOne
    // db.collection('Todos').deleteOne({
    //     text : 'Eat lunch'
    // }).then((res) => {
    //     console.log(res);
    // });

    //findOneAndDelete - returns the deleted file
    // db.collection('Todos').findOneAndDelete({
    //     completed : false
    // }).then((res) => {
    //     console.log(res);
    // });

    // db.collection('Users').deleteMany({
    //     name : 'Mike'
    // }).then((res) => {
    //     console.log(res);
    // });

    db.collection('Users').findOneAndDelete({
        _id : new ObjectID('5a464159fbcae72c88e9ff77')
    }).then((res) => {
        console.log(res);
    });

    //db.close();
});