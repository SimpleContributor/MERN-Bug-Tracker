const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { userOneId, userOne, userTwoId, userTwo, setupDatabase } = require('./fixtures/db');

setupDatabase();

test('Should Signup a New User', async () => {
    const response = await request(app).post('/api/users').send({
        name: "Caleb Coe",
        email: "calebcoe0@gmail.com",
        password: "123456"
    }).expect(200);

    const user = await User.findById(response.body.userObj._id);
    expect(user).not.toBeNull();

    expect(user.password).not.toBe('123456');
});


