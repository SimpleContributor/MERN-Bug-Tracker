const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Profile = require('../models/Profile');

let userToken;
let userId;

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


test('Get the User Data', async () => {
    const response = await request(app)
        .get('/api/auth')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    userId = response.body._id;

    expect(response.body).not.toBeNull();
});


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


test('Get User Profile Based on Users Token', async () => {
    const response = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.availability).toBe("Test Test");
    expect(response.body.user.name).toBe("Caleb Coe");
})


test('Get All User Profiles', async () => {
    const response = await request(app)
        .get('/api/profile')
        .send()
        .expect(200);

    expect(response.body.allProfiles).not.toBeNull();    
})


test('Get User Profile Based on ID', async () => {
    const response = await request(app)
        .get(`/api/profile/user/${userId}`)
        .send()
        .expect(200);

    expect(response.body.user.githubusername).toBe("TestGit");
})


test('Get Users Projects By Id', async () => {
    const response = await request(app)
    .get(`/api/profile/projects/${userId}`)
    .send()
    .expect(200);
    
    expect(response.body.user).toBe('Caleb Coe');
})




///// DELETE TESTS /////
test('Delete User & Profile', async () => {
    const response = await request(app)
        .delete('/api/profile')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('User and Profile deleted...');
})