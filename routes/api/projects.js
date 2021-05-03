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

        let projectObj = {
            _id: project._id,
            title: project.title
        }
        await profile.projects.push(projectObj);
        await profile.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...'); 
    }
})


// @route   PUT api/projects/:project_id/:user_id
// @desc    Add a new user to the project
// @access  Private
router.put('/:project_id/:user_id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.project_id);
        if (!project) return res.status(404).send('No Project found...');
        
        const profile = await Profile.findOne({ user: req.params.user_id });
        if (!profile) return res.status(404).send('User does not have a profile to add the project to.');

        const user = await User.findById(req.params.user_id ).select('-password');
        if (!user) return res.status(418).send('No User found...');

        const userData = { 
            user: user.id, 
            name: user.name 
        };
        
        const validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) return res.status(400).send('User does not have permission to alter this project...');
        
        const existingUser = await project.users.some(el => el.user.toString() === req.params.user_id);
        if (existingUser) return res.status(202).send('User already included in this project...');

        let projectObj = {
            _id: project._id,
            title: project.title
        }
        await profile.projects.push(projectObj);
        await profile.save();

        await project.users.push(userData);
        await project.save();

        res.json(project.users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
})


// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        Project.find({}, (err, projects) => {
            let allProjects = {};
    
            projects.forEach(project => {
                allProjects[project.title] = project;
            })
    
            res.json({ allProjects });
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
})


// @route   GET api/projects/:project_id
// @desc    Get a specific project by id
// @access  Private
router.get('/:project_id', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.project_id);
        if (!project) return res.status(404).send('Project not found...');

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error...' })
    }
})


// @route   GET api/projects/:project_id/users
// @desc    Get all valid users for a project
// @access  Private
router.get('/:project_id/users', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.project_id);
        if (!project) return res.status(404).send('Project not found...');

        res.json(project.users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error...' })
    }
})


// @route   GET api/projects/:project_id/tickets
// @desc    Get all tickets for a project
// @access  Private
router.get('/:project_id/tickets', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.project_id);
        if (!project) return res.status(404).send('Project not found...');

        res.json(project.tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error...' })
    }
})


// @route   DELETE api/projects/:project_id/:user_id
// @desc    Remove a user from the project
// @access  Private
router.delete('/:project_id/:user_id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.project_id});
        if (!project) return res.status(404).send('Project not found...');

        let validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project... INVALID USER');
        };
        
        const userIndex = await project.users.findIndex(el => el.user.toString() === req.params.user_id);
        if (userIndex >= 0) {
            await project.users.splice(userIndex, 1);
            await project.save();
        } else {
            return res.status(404).send('User not Found to be a part of this project... UNKNOWN USER');
        };

        const profile = await Profile.findOne({ user: req.params.user_id });
        if (!profile) return res.status(404).send('User does not have a profile...');
        const projectIndex = await profile.projects.findIndex(project => project._id.toString() === req.params.project_id);
        if (projectIndex < 0) return res.status(404).send('User does not have this project in their profile.');
        await profile.projects.splice(projectIndex, 1);
        await profile.save();

        res.json(project.users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...'); 
    };
});


// @route   DELETE api/projects/:project_id
// @desc    Delete a project
// @access  Private

// Add logic to remove the project id from any valid users profiles.
// for each user on the project, go to their profile and remove the project
router.delete('/:project_id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.project_id});
        if (!project) return res.status(404).send('Project not found...');
    
        let validUser = await project.users.some(el => el.user.toString() === req.user.id);
        if (!validUser) {
            return res.status(404).send('User not Found to be a part of this project... INVALID USER');
        };

        project.users.forEach(async user => {
            let _id = user.user;
            
            const profile = await Profile.findOne({ user: _id });
            if (!profile) return res.status(400).send('No profile...');
            
            let projectIndex = await profile.projects.findIndex(project => project._id.toString() === req.params.project_id);
            if (projectIndex < 0) return res.status(400).send('No project by this id for this user...');
            
            await profile.projects.splice(projectIndex, 1);
            await profile.save();
        })
        
        await Project.findOneAndRemove({ _id: project._id });
        res.json({ msg: 'Project deleted...' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
})

module.exports = router;
