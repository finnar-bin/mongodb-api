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
app.post('/todos', authenticate, async (req, res) => {
    const todo = new Todo({
        text : req.body.text,
        _creator : req.user._id
    });
    try {
        const doc = await todo.save();
        res.send(doc);
    } catch (error) {
        res.status(400).send(error);
    }
});

// get all todos
app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({
                        _creator : req.user._id
                    });
        res.status(200).send({todos});
    } catch (error) {
        res.status(400).send(error);
    }
});

// get todo by id
app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    try {
        const todo = await Todo.findOne({
                        _id : id,
                        _creator : req.user._id
                    });
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    } catch (error) {
        res.status(400).send();
    }
});

// delete todo by id
app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    try {
        const todo = await Todo.findOneAndRemove({
                        _id : id,
                        _creator : req.user._id
                    });
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    } catch (error) {
        res.status(400).send()
    }
});

// update todo by id
app.patch('/todos/:id', authenticate, async (req, res) => {
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

    try {
        const todo = await Todo.findOneAndUpdate({
                        _id : id,
                        _creator : req.user._id
                    }, {
                        $set : body
                    }, {
                        new : true
                    });
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    } catch (error) {
        res.status(400).send();
    }
});

// user register
app.post('/users', async (req, res) => {
    try {
        const userInfo = _.pick(req.body, ['email', 'password']);
        const user = new User(userInfo);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// get user info
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// user log in
app.post('/users/login', async (req, res) => {
    try {
        const userInfo = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(userInfo.email, userInfo.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// user log out
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (error) {
        res.status(400).send();
    }
})
// port setup
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});

module.exports = {
    app
}