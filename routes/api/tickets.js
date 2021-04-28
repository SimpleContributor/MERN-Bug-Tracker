const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');



// @route   POST api/tickets/:project_id
// @desc    Create a Ticket
// @access  Private
router.post('/:project_id', auth, async (req, res) => {
    const {
        ticket,
        severity,
        status,
    } = req.body;

    const ticketFields = {
        comments: []
    };

    if (ticket) ticketFields.ticket = ticket;
    if (severity) ticketFields.severity = severity;
    if (status) ticketFields.status = status;
    ticketFields.user = req.user.id;
    ticketFields.name = req.user.name;
    //ticketFields._id = new mongoose.Types.ObjectId() //DOES NOT FIX err: Cast to ObjectId failed for value "ticket" at path "_id" for model "project"
    //this error was caused by the model having an extra piece of data that a document in the database did not have. 

    try {
        const project = await Project.findById(req.params.project_id);
        if (!project) return res.status(404).send('No project by this name found.');
        console.log(project);

        let validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project...');
        }

        project.tickets.push(ticketFields);
        await project.save();

        res.json(project.tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');        
    }
})



// @route   POST api/tickets/:project_id/:ticket_id/comment
// @desc    Create a comment on a ticket
// @access  Private
router.post('/:project_id/:ticket_id/comment', auth, async (req, res) => {
    const { comment } = req.body;
    // const ticketIdx = req.params.ticket_id;

    const commentFields = {};

    commentFields.user = req.user.id;
    commentFields.name = req.user.name;
    if (!comment) {
        // 418: The server refuses the attempt to brew coffee with a teapot
        return res.status(418).json({ msg: 'Need to enter a comment...'});
    }

    commentFields.comment = comment;

    try {
        const project = await Project.findById(req.params.project_id);
        const ticketIdx = project.tickets.findIndex(ticket => ticket._id.toString() === req.params.ticket_id);

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



// @route   GET api/tickets/:project_id
// @desc    Get all tickets in a project
// @access  Private
router.get('/:project_id', auth, async (req, res) => {
    try {
        
        const project = await Project.findById(req.params.project_id);
        if (!project) return res.status(500).json({ msg: 'No project by this name found.' });
        
        const validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project...');
        }
        
        if (project.tickets.length === 0) return res.json({ msg: "This project does not have any tickets." });

        res.json(project.tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    };
});


// @route   GET api/tickets/:project_id/:ticket_id
// @desc    Get a specific ticket
// @access  Private
router.get('/:project_id/:ticket_id', auth, async (req, res) => {
    try {
        
        const project = await Project.findById(req.params.project_id);
        if (!project) return res.status(500).json({ msg: 'No project by this name found.' });
        
        const validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project...');
        }

        if (project.tickets.length === 0) return res.json({ msg: "This project does not have any tickets." });
        
        const ticketIndex = project.tickets.findIndex(ticket => ticket._id.toString() === req.params.ticket_id);
        if (ticketIndex === -1) return res.status(500).json({ msg: 'No ticket found.' });

        res.json(project.tickets[ticketIndex]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    };
});

module.exports = router;
