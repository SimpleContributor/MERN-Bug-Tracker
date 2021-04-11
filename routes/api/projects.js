const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Project = require('../../models/Project');
const Profile = require('../../models/Profile');

// @route   GET api/projects
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Projcets Route'));


// @route   POST api/projcets
// @desc    Create a new project
// @access  Private
router.post('/', auth, async (req, res) => {

    const {
        title,
        description,
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

module.exports = router;
