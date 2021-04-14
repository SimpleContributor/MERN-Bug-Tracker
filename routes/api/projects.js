const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route   GET api/projects
// @desc    Test route
// @access  Public
// router.get('/', (req, res) => res.send('Projcets Route'));


// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, async (req, res) => {

    const {
        title,
        description,
        status,
        ticket
    } = req.body;

    const projectFields = {
        users: [],
        tickets: []
    };
    let userData = {
        user: req.user.id,
        name: req.user.name
    };
    
    if (userData) projectFields.users.push(userData);
    if (title) projectFields.title = title;
    if (description) projectFields.description = description;
    if (status) projectFields.status = status;
    if (ticket) projectFields.tickets.push(ticket);

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        let project = await Project.findOne({ title });

        if (!profile) {
            return res.status(400).json({ msg: 'No Profile found...' });
        }
        if (project) {
            return res.status(400).json({ msg: 'Project by this name already exists...' });
        }

        project = new Project(projectFields);
        await project.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...'); 
    }
})


// @route   GET api/projects
// @desc    Get all projects
// @access  Private
router.get('/', async (req, res) => {
    Project.find({}, (err, projects) => {
        let allProjects = {};

        projects.forEach(project => {
            allProjects[project.title] = project;
        })

        res.json({ allProjects });
    })
})


// @route   PUT api/projects/ticket/:project_id
// @desc    Create a Ticket
// @access  Private
router.put('/ticket/:project_id', auth, async (req, res) => {

    const {
        ticket,
        severity,
        status,
    } = req.body;

    const ticketFields = {
        comments: []
    };

    // let userData = {
    //     _id: req.user.id,
    //     name: req.user.name
    // };

    ticketFields.user = req.user.id;
    ticketFields.user.name = req.user.name;
    if (ticket) ticketFields.ticket = ticket;
    if (severity) ticketFields.severity = severity;
    if (status) ticketFields.status = status;

    try {
        const project = await Project.findOne({ _id: req.params.project_id});

        let validUser = project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project...');
        }

        await project.tickets.unshift(ticketFields);
        await project.save();

        res.json(project.tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');        
    }
})

module.exports = router;
