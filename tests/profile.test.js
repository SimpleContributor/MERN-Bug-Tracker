const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { userOneId, userOne, userTwoId, userTwo, setupDatabase } = require('./fixtures/db');
const { urlencoded } = require('express');

/* 
Order of testing:
- Create a new account (only test located in tests/user.test.js)   |  [COMPLETE] //
- Sign in to that new account                                      |  [COMPLETE] //
- Look at user data based on jwt                                   |  [COMPLETE] //
- Create a profile                                                 |  [COMPLETE] //
- Update (change) a field for profile                              |  [COMPLETE] //
- Look at profile based on jwt                                     |  [COMPLETE] //
- Look at all profiles                                             |  [COMPLETE] //
- Look at specific profile based on user id                        |  [COMPLETE] //
- Create a project                                                 |  [COMPLETE] //
- Look at all projects in a profile based on user id               |  [COMPLETE] //
- Look at a specific project based on project id                   |  [COMPLETE] //
- Update (add) valid users on a project                            |  [COMPLETE] //
- Look at users on a project based on project id                   |  [COMPLETE] //
- Remove a valid user from a project                               |  [COMPLETE] //
- Create a ticket for a project based on project id                |  [COMPLETE] //
- Create a comment on a ticket based on project and ticket ids     |  [COMPLETE] //
- Look at all tickets based on project id                          |  [COMPLETE] //
- Look at a specific ticket based on project and ticket ids        |  [COMPLETE] //
- Delete comment by project, ticket and comment id                 |  [NO ROUTE] //////
- Delete ticket by project and ticket id                           |  [NO ROUTE] //////
- Delete project by project id                                     |  [NO ROUTE] //////
- Delete user & profile                                            |  [COMPLETE] //
*/

let userToken;
let userId;
let projectId;
let ticketId;
let commentId;

setupDatabase();

// @desc   | Create a new account
// @route  | POST /api/users
// @access | Public
test('Should Signup a New User', async () => {
    const response = await request(app)
        .post('/api/users')
        .send({
            name: "Caleb Coe",
            email: "calebcoe0@gmail.com",
            password: "123456"
        })
        .expect(200);

    const user = await User.findById(response.body.userObj._id);
    
    expect(user).not.toBeNull();

    expect(user.password).not.toBe('123456');
});


// @desc   | Log in to the new account
// @route  | POST /api/auth
// @access | Public
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


// @desc   | Look at user data based on jwt
// @route  | GET /api/auth
// @access | Private
test('Get the User Data', async () => {
    const response = await request(app)
        .get('/api/auth')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    userId = response.body._id;

    expect(response.body).not.toBeNull();
});


// @desc   | Create a profile
// @route  | POST /api/profile
// @access | Private
test('Create a Profile', async () => {
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


// @desc   | Update (change) a field for profile
// @route  | POST /api/profile
// @access | Private
test('Update a Profile Field', async () => {
    const response = await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .set('Content-Type', 'application/json')
        .send({
            "githubusername": "UpdateProfileTest"
        })
        .expect(200);

    let profile = await Profile.findOne({ user: response.body.user })
    expect(profile).not.toBeNull();

    expect(response.body.availability).toBe("Test Test");
    expect(response.body.githubusername).toBe("UpdateProfileTest");
})


// @desc   | Look at profile based on jwt
// @route  | GET /api/profile/me
// @access | Private
test('Get User Profile Based on Users Token', async () => {
    const response = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.availability).toBe("Test Test");
    expect(response.body.user.name).toBe("Caleb Coe");
})


// @desc   | Look at all profiles
// @route  | GET /api/profile
// @access | Public
test('Get All User Profiles', async () => {
    const response = await request(app)
        .get('/api/profile')
        .send()
        .expect(200);

    expect(response.body.allProfiles).not.toBeNull();    
})


// @desc   | Look at specific profile based on user id
// @route  | GET /api/profile/user/:user_id
// @access | Public
test('Get User Profile Based on ID', async () => {
    const response = await request(app)
        .get(`/api/profile/user/${userId}`)
        .send()
        .expect(200);

    expect(response.body.user.githubusername).toBe("UpdateProfileTest");
})


// @desc   | Create a Project
// @route  | POST /api/projects/
// @access | Private
test('Create a project', async () => {
    const response = await request(app)
        .post('/api/projects/')
        .set('x-auth-token', userToken)
        .set('Content-Type', 'application/json')
        .send({
            "title": "JEST TEST",
            "description": "This is a test project created for Jest testing.",
            "status": "Testing!"
        })
        .expect(200);

    expect(response.body.status).toBe('Testing!');
})


// @desc   | Look at all projects in a profile based on user id
// @route  | GET /api/profile/projects/:user_id
// @access | Public
test('Get Users Projects By User Id', async () => {
    const response = await request(app)
        .get(`/api/profile/projects/${userId}`)
        .send()
        .expect(200);
    
    expect(response.body.user).toBe('Caleb Coe');

    projectId = response.body.projects[0]._id;
})


// @desc   | Look at a specific project based on project id
// @route  | GET /api/projects/:project_id
// @access | Private
test('Get a specific project by id', async () => {
    const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200)
})


// @desc   | Update (add) valid users on a project
// @route  | PUT api/projects/:project_id/:user_id
// @access | Private
test('Update (add) valid users on a project', async () => {
    const response = await request(app)
        .put(`/api/projects/${projectId}/${userTwoId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200)
})


// @desc   | Look at users on a project based on project id
// @route  | GET api/projects/:project_id/users
// @access | Private
test('Look at valid users on a project', async () => {
    const response = await request(app)
        .get(`/api/projects/${projectId}/users`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200)
       
    expect(response.body.length).toBe(2);    
})


// @desc   | Update (remove) valid users on a project
// @route  | DELETE api/projects//:project_id/:user_id
// @access | Private
test('Remove a valid user from a project', async () => {
    const response = await request(app)
        .delete(`/api/projects/${projectId}/${userTwoId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200)

        expect(response.body.length).toBe(1);
})


// @desc   | Create a ticket for a project based on project id
// @route  | POST api/tickets/:project_id
// @access | Private
test('Create a ticket for a project', async () => {
    const response = await request(app)
        .post(`/api/tickets/${projectId}`)
        .set('x-auth-token', userToken)
        .set('Content-Type', 'application/json')
        .send({
            "ticket": "Jest Test Ticket",
            "severity": "MODERATE",
            "status": "In Progress"
        })
        .expect(200);

    expect(response.body.length).toBe(1);  
    ticketId = response.body[0]._id;  
})


// @desc   | Create a comment on a ticket based on project and ticket ids
// @route  | POST api/tickets/:project_id/:ticket_id/comment
// @access | Private
test('Create a comment on a ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets/${projectId}/${ticketId}/comment`)
        .set('x-auth-token', userToken)
        .set('Content-Type', 'application/json')
        .send({
            "comment": "Test comment."
        })
        .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].comment).toBe("Test comment.");

    commentId = response.body[0]._id;
})


// @desc   | Look at all tickets based on project id
// @route  | GET api/tickets/:project_id
// @access | Private
test('Look at all tickets based on project id', async () => {
    const response = await request(app)
        .get(`/api/tickets/${projectId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.length).toBe(1);
})


// @desc   | Look at a specific ticket based on project and ticket ids
// @route  | GET api/tickets/:project_id/:ticket_id
// @access | Private
test('Look at a specific ticket', async () => {
    const response = await request(app)
        .get(`/api/tickets/${projectId}/${ticketId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.comments[0].comment).toBe("Test comment.");
})





////////////////////////
////////////////////////
///// DELETE TESTS /////
////////////////////////
////////////////////////


// @desc   | Delete comment by project, ticket and comment id
// @route  | DELETE /api/tickets/:project_id/:ticket_id/:comment_id
// @access | Private
test('Delete Comment', async () => {
    const response = await request(app)
        .delete(`/api/tickets/${projectId}/${ticketId}/${commentId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('Comment deleted...');
})


// @desc   | Delete ticket by project and ticket id
// @route  | DELETE /api/tickets/:project_id/:ticket_id
// @access | Private
test('Delete Ticket', async () => {
    const response = await request(app)
        .delete(`/api/tickets/${projectId}/${ticketId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('Ticket deleted...');
})


// @desc   | Delete project by project id
// @route  | DELETE /api/projects/:project_id
// @access | Private
test('Delete Project', async () => {
    const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('Project deleted...');
})



// @desc   | Delete user & profile
// @route  | DELETE /api/profile
// @access | Private
test('Delete User & Profile', async () => {
    const response = await request(app)
        .delete('/api/profile')
        .set('x-auth-token', userToken)
        .send()
        .expect(200);

    expect(response.body.msg).toBe('User and Profile deleted...');
})