const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    }, 

    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user' 
        },

        name: {
            type: String,
            ref: 'user'
        }
    }],

    tickets: [{
        ticket: String,

        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },

            timeAdded: {
                type: Date,
                default: Date.now
            },

            comment: String
        }],


    }]
});

module.exports = Project = mongoose.model('project', ProjectSchema);
