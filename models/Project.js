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

    status: {
        type: String,
        // required: true
    },

    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',

            name: {
                type: String,
                ref: 'user'
            }
        }
    }],

    tickets: [{
        ticket: String,

        ticketTime: {
            type: Date,
            default: Date.now
        },

        severity: String,

        status: String,

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',

            name: {
                type: String,
                ref: 'user'
            },
        },
        
        
        comments: [{
            comment: String,

            commentTime: {
                type: Date,
                default: Date.now
            },

            user: {
                type: mongoose.Schema.Types.ObjectId,

                name: {
                    type: String,
                    ref: 'user'
                }
            }

        }],


    }]
});

module.exports = Project = mongoose.model('project', ProjectSchema);
