const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');


// @route   PUT api/tickets/:ticket_id/comment
// @desc    Create a comment on a ticket
// @access  Private
router.post('/:project_id/:ticket_id/comment', auth, async (req, res) => {
    const { comment } = req.body;
    const ticketIdx = req.params.ticket_id;

    const commentFields = {};

    commentFields.user._id = req.user.id;
    commentFields.user.name = req.user.name;
    if (!comment) {
        // 418: The server refuses the attempt to brew coffee with a teapot
        return res.status(418).json({ msg: 'Need to enter a comment...'});
    }

    commentFields.comment = comment;

    try {
        const project = await Project.findById(req.params.project_id);
        const ticketIdx = await project.tickets.findIndex(ticket => ticket._id.toString() === req.params.ticket_id);

        const validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            // 423: The resource that is being accessed is locked
            return res.status(423).send('User not Found to be a part of this project...');
        }

        await project.tickets[ticketIdx].comments.push(commentFields);
        await project.save();

        res.json(project.tickets[ticketIdx].comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
})

module.exports = router;



// router.put('/ticket/:project_id', auth, async (req, res) => {

//     const {
//         ticket,
//         severity,
//         status,
//     } = req.body;

//     const ticketFields = {
//         comments: []
//     };

//     ticketFields.user = req.user.id;
//     ticketFields.user.name = req.user.name;
//     if (ticket) ticketFields.ticket = ticket;
//     if (severity) ticketFields.severity = severity;
//     if (status) ticketFields.status = status;

//     try {
//         const project = await Project.findOne({ _id: req.params.project_id});

//         let validUser = project.users.some(el => el.user.toString() === req.user.id);
//         if (!validUser) {
//             return res.status(404).send('User not Found to be a part of this project...');
//         }

//         await project.tickets.unshift(ticketFields);
//         await project.save();

//         res.json(project.tickets);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error...');        
//     }
// })