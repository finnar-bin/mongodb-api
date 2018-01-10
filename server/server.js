require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose'); //establish db connection
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
// dynamic port
const port = process.env.PORT;

// sets a middleware that will set return value to json
app.use(bodyParser.json());

// router config
// post a todo
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text : req.body.text,
        _creator : req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

// get all todos
app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator : req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// get todo by id
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id : id,
        _creator : req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

// delete todo by id
app.delete('/todos/:id', authenticate, (req, res) => {

    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id : id,
        _creator : req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.status(200).send({todo});
    }).catch((e) => res.status(400).send());
});

// update todo by id
app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({
        _id : id,
        _creator : req.user._id
    }, {
        $set : body
    }, {
        new : true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

// user register
app.post('/users', (req, res) => {
    var userInfo = _.pick(req.body, ['email', 'password']);
    var user = new User(userInfo);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// get user info
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// user log in
app.post('/users/login', (req, res) => {
    var userInfo = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(userInfo.email, userInfo.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// user log out
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => {
        res.status(400).send();
    })
})
// port setup
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});

module.exports = {
    app
}