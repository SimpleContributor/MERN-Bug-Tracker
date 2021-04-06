const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { userOneId, userOne, userTwoId, userTwo, setupDatabase } = require('./fixtures/db');

setupDatabase();

let userToken;

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


test('Should Login User', async () => {
    const response = await request(app).post('/api/auth').set('Content-Type', 'application/json').send({
        email: "calebcoe0@gmail.com",
        password: "123456"
    }).expect(200);

    expect(response.body.token).not.toBeNull();

    userToken = response.body.token;
})


test('Get User Profile Based on Users Token', async () => {
    const response = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .send()
        .expect(400);

    expect(response.body.msg).toBe("There is no profile for this user...");
})
