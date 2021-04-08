const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/profile
// @desc    Create/Update a user profile
// @access  Private
router.post('/', auth, async (req, res) => {
    
    const {
        projects,
        availability,
        githubusername
    } = req.body;
    
    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (availability) profileFields.availability = availability;
    if (githubusername) profileFields.githubusername = githubusername;
    if (projects) {
        profileFields.projects = projects.split(',').map(project => project.trim());
    }
    
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        
        if(profile) {
            // Update Profile if one exists
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id }, 
                { $set: profileFields },
                { new: true }
            );
                
            return res.json(profile);
        }
            
        // Create Profile if one does not exist
        profile = new Profile(profileFields);
        await profile.save();
            
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
})
    
// @route   GET api/profile/me
// @desc    Get the user based on token
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // populate will add the authenticated users name (from registering their account) to the
        // user field in Profile
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user...' })
        }

        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error...');
    }
});
    
// @route   GET api/profile
// @desc    Read all profiles
// @access  Public
router.get('/', async (req, res) => {
    Profile.find({}, (err, profiles) => {
        let allProfiles = {};

        profiles.forEach(profile => {
            allProfiles[profile.user] = profile;
        })

        res.json({ allProfiles });
    })
})

// @route   GET api/profile/user:id
// @desc    Read a single user based on ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const user = await Profile.findOne({ user: req.params.user_id }).select('-password');

        if (!user) {
            return res.status(400).json({ msg: 'Profile Not Found!!!' })
        }
    
        res.json({ user });
    } catch (err) {
        // If the entered :user_id is invalid, return the proper error message
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: '...Profile Not Found...' }) 
        }

        res.status(500).send('Server Error...');
    }
})

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    // @todo - remove users posts

    try {
        // Remove the Profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove the User
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User and Profile deleted...' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error...');
    }
})

// @route   GET api/profile/projects
// @desc    Get a users projects based on their id
// @access  Public
router.get('/projects/:user_id', async (req, res) => {
    try {
        const user = await Profile.findOne({ user: req.params.user_id }).select('-password').populate('user', ['name']);

        if (!user) {
            return res.status(400).json({ msg: "Profile not found!!!" })
        }

        res.json({ 
            user: user.user.name,
            githubusername: user.githubusername,
            projects: user.projects
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error...');
    }
})

module.exports = router;
