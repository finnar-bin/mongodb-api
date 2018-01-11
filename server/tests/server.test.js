const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {seederTodos, seederUsers, populateTodos, populateUsers} = require ('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test text';

        request(app)
            .post('/todos')
            .set('x-auth', seederUsers[0].tokens[0].token)
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
            .set('x-auth', seederUsers[0].tokens[0].token)
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
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return a todo doc', (done) => {
        request(app)
            .get(`/todos/${seederTodos[0]._id.toHexString()}`)
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seederTodos[0].text);
            })
            .end(done);
    });

    it('should not return a todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${seederTodos[1]._id.toHexString()}`)
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        var id = new ObjectID();

        request(app)
            .get(`/todos/${id.toHexString()}`)
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = seederTodos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', seederUsers[1].tokens[0].token)
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
                    expect(todo).toBeFalsy();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not remove a todo created by another user', (done) => {
        var hexId = seederTodos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', seederUsers[1].tokens[0].token)
            .expect(404)
            .end((e, res) => {
                if (e) {
                    return done(e);
                }

                //query db with findById -> toNotExist
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return a 404 if todo not found', (done) => {
        var id = new ObjectID();
        
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .set('x-auth', seederUsers[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if object id is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .set('x-auth', seederUsers[1].tokens[0].token)
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
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(true);
                //expect(res.body.todo.completedAt).toBeA('number');
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should not update the todo created by a different user', (done) => {
        var id = seederTodos[1]._id.toHexString();
        var body = {
            text : "new text here",
            completed : true
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(404)
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
            .set('x-auth', seederUsers[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeFalsy();
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(seederUsers[0]._id.toHexString());
                expect(res.body.email).toBe(seederUsers[0].email);
            })
            .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'something@email.com'
        var password = '123456'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({
                    email
                }).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'incorrectemail';
        var password = '12';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        // expect 400
        var email = 'testemail@example.com';
        var password = '123456';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email : seederUsers[1].email,
                password : seederUsers[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(seederUsers[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access : 'auth',
                        token : res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));      
            });
    });

    it('should reject invalid login', (done) => {
        // invalid password - 400 - xauth not exist - user tokens = 0
        request(app)
            .post('/users/login')
            .send({
                email : seederUsers[1].email,
                password : seederUsers[1].password + '123'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(seederUsers[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e)); 
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on log out', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', seederUsers[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(seederUsers[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});