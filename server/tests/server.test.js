const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');


//seeder
const seederTodos = [{
    _id : new ObjectID(),
    text : 'First test'
}, {
    _id : new ObjectID(),
    text : 'Second test',
    completed : true,
    completedAt : 52525
}];

//used to make preparations before test is run
//remove all entries in db before running test below
beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(seederTodos);
    }).then(() => {
        done();
    });
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(err);
                })
            })
    });

    it('should not create todo with invalid body data', (done) => {
        var text = '';

        request(app)
            .post('/todos')
            .send({text})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({}).then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    })
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return a todo doc', (done) => {
        request(app)
            .get(`/todos/${seederTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seederTodos[0].text);
            })
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        var id = new ObjectID();

        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = seederTodos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((e, res) => {
                if (e) {
                    return done(e);
                }

                //query db with findById -> toNotExist
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return a 404 if todo not found', (done) => {
        var id = new ObjectID();
        
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if object id is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = seederTodos[0]._id.toHexString();
        var body = {
            text : "new text here",
            completed : true
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var id = seederTodos[1]._id.toHexString();
        var body = {
            text : "new text here",
            completed : false
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
})