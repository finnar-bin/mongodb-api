const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose'); //establish db connection
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

//middleware return value = json
app.use(bodyParser.json());

//router
app.post('/todos', (req, res) => {
    //console.log(req.body);
    var todo = new Todo({
        text : req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        //use object to easily add features
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
        //console.log('Invalid ID.');
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
            //console.log('No results found.');
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
        //console.log(e);
    });
});

app.delete('/todos/:id', (req, res) => {
    //get id
    var id = req.params.id;
    //validate id -> not valid, ret 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    //remove todo by id
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.status(200).send({todo});
    }).catch((e) => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set : body}, {new : true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});

module.exports = {
    app
}