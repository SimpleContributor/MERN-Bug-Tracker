const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    
    name: {
        type: String,
        ref: 'user'
    },

    projects: [{
        _id: mongoose.Schema.Types.ObjectId,
        title: String
    }],

    availability: {
        type: String,
        required: true
    },

    githubusername: {
        type: String
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
