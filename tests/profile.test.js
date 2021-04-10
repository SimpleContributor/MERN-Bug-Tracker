const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Profile = require('../models/Profile');

let userToken;
let userId;


// @route POST /api/auth
// @access Public
test('Should Login User', async () => {
    const response = await request(app)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
            email: "calebcoe0@gmail.com",
            password: "123456"
        })
        .expect(200);

    expect(response.body.token).not.toBeNull();

    userToken = response.body.token;
})


// @route GET /api/auth
// @access Private
test('Get the User Data', async () => {
    const response = await request(app)
        .get('/api/auth')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    userId = response.body._id;

    expect(response.body).not.toBeNull();
});


// @route POST /api/profile
// @access Private
test('Create/Update a Profile', async () => {
    const response = await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .set('Content-Type', 'application/json')
        .send({
            "projects": "Project0, Project1, Project A, Project B",
            "availability": "Test Test",
            "githubusername": "TestGit"
        })
        .expect(200);

    let profile = await Profile.findOne({ user: response.body.user })
    expect(profile).not.toBeNull();

    expect(response.body.githubusername).toBe("TestGit");
})


// @route GET /api/profile/me
// @access Private
test('Get User Profile Based on Users Token', async () => {
    const response = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.availability).toBe("Test Test");
    expect(response.body.user.name).toBe("Caleb Coe");
})


// @route GET /api/profile
// @access Public
test('Get All User Profiles', async () => {
    const response = await request(app)
        .get('/api/profile')
        .send()
        .expect(200);

    expect(response.body.allProfiles).not.toBeNull();    
})


// @route GET /api/profile/user/:user_id
// @access Public
test('Get User Profile Based on ID', async () => {
    const response = await request(app)
        .get(`/api/profile/user/${userId}`)
        .send()
        .expect(200);

    expect(response.body.user.githubusername).toBe("TestGit");
})


// @route GET /api/profile/projects/:user_id
// @access Public
test('Get Users Projects By Id', async () => {
    const response = await request(app)
    .get(`/api/profile/projects/${userId}`)
    .send()
    .expect(200);
    
    expect(response.body.user).toBe('Caleb Coe');
})



///// DELETE TESTS /////


// @route DELETE /api/profile
// @access Private
test('Delete User & Profile', async () => {
    const response = await request(app)
        .delete('/api/profile')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('User and Profile deleted...');
})