const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { response } = require('express');

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
    }
)

router.get('/', async (req, res) => {
    Profile.find({}, (err, profiles) => {
        let profileMap = {};
        console.log(profiles)
        profiles.forEach(profile => {
            profileMap[profile.user] = profile.user;
        })

        res.json({ profileMap });
    })
})

router.get('/user:id', async (req, res) => {
    const { id } = req.body;
    console.log( id );

    
    try {
        let user = await Profile.findById({ user: id });
        if (!user) {
            return res.status(400).json({ msg: 'There are no users that match this Username.' })
        }
    
        res.json({ user });

    } catch (err) {
        res.status(500).send('Server Error...');
    }
})

module.exports = router;
