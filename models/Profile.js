const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    projects: {
        type: [String],
    },

    status: {
        type: Boolean,
        required: true,
        default: false
    },

    githubusername: {
        type: String
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
