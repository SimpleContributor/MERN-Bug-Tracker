const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Project = require('../../models/Project');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "John Doe",
    email: "jdoe@gmail.com",
    password: "123456",
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    password: "123456",
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Profile.deleteMany();
    await Project.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    setupDatabase
}
