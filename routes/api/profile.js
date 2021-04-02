const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get the user based on token
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // populate will add the _id from GET auth user (based on token from logging in) to the user value
        // the profile will have two _ids, its own _id and the authenticated users _id
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


// @route   POST api/profile
// @desc    Create/Update a user profile
// @access  Private
router.post('/', [ auth, [
    check('status', 'Status is required').notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        projects,
        status,
        githubusername
    } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (status) profileFields.status = status;
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

module.exports = router;