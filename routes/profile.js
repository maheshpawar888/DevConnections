const express = require('express');
const auth = require('../middleware/auth');
const { findOneAndUpdate } = require('../models/Profile');
const Profile = require('../models/Profile');
const User = require('../models/User');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Post = require('../models/Post');
const request = require('request');
const githubclientID = 'be391a0746013bbfe827';
const githubclientSecret = '93423b91032e003fff4cb4cb4d0e523943af7d0e' 

// @route   GET api/profile/me
// @desc    get current user profile
// @access  Private

router.get('/me',auth,async(req, res) =>{
    try{
        
        const profile = await Profile.findOne({user: req.user.id })
            .populate('user',['name','avtar']);
        if( !profile ){
            return res.status(400).json({ msg: 'There is no profile for this user..!!' })
        }

        res.json(profile);
    }catch(err){
        res.status(500).json( err )
    }
})

// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post('/',[
    check('skills','Skills are required..!!').not().isEmpty(),
    check('status','Status is required..!!').not().isEmpty()

],auth,async(req,res)=>{

    const errors = validationResult( req );
    
    if( !errors.isEmpty() ){
        return res.status(400).json({ errors: errors.array() })
    }

    const { company, website, location, bio, 
        status, githubusername, skills,youtube,facebook, instagram, linkedin, twitter
     } = req.body;

     const profileFields = { };
     profileFields.user = req.user.id;
     if( company ) profileFields.company = company;
     if( website ) profileFields.website = website;
     if( location ) profileFields.location = location;
     if( bio ) profileFields.bio = bio;
     if( status ) profileFields.status = status;
     if( githubusername ) profileFields.githubusername = githubusername;

     profileFields.skills = skills.split(',').map( (skill) => skill.trim());

     profileFields.social = { };
     if( youtube ) profileFields.social.youtube = youtube;
     if( facebook ) profileFields.social.facebook = facebook;
     if( instagram ) profileFields.social.instagram = instagram;
     if( linkedin ) profileFields.social.linkedin = linkedin;
     if( twitter ) profileFields.social.twitter = twitter;

     try{
        let profile = await Profile.findOne({ user: req.user.id});
        

        if( profile ){
            // update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                { $set: profileFields},
                { new: true}
            )
            return res.json(profile);
        }   
        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json( profileFields );
        
     }catch( err ){
        res.status(500).json(err)
     }

})

// @route   Get api/profile
// @desc    Get all the users profiles
// @access  Public

router.get('/', async(req, res) =>{
    try {   
        const profiles = await Profile.find().populate('user',['name','avtar']);
        res.json( profiles )
    } catch (err) {
        res.status(500).json(err)
    }
})

// @route   Get profile/user/:id
// @desc    Get the user profile by user_id
// @access  Public

router.get('/user/:id', async(req, res) =>{
    try {   
        const profile = await Profile.findOne({user: req.params.id}).populate('user',['name','avtar']);

        if( !profile ) return res.status(400).json({ msg: 'Profile not found..!!' })

        res.json( profile )
    } catch (err) {
        if( err.kind === 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found..!!' })
        }
        res.status(500).json('Server Error..!!')
    }
})

// @route   Delete api/profile
// @desc    Delete the users profile
// @access  Private

router.delete('/',auth,async(req, res) =>{
    try {
        
        // delete all the posts
        await Post.deleteMany({ user: req.user.id });

        // delete profile
        await Profile.findOneAndRemove({user: req.user.id });

        //delete user
        await User.findOneAndRemove({ _id: req.user.id });

        res.status(200).json({ msg: "User Deleted...!!" })
    } catch (err) {
        res.status(500).json(err)
    }
})

// @route   Put profile/experience
// @desc    Add experience to the users profile
// @access  Private

router.put('/addExperience', auth ,async( req,res) =>{

    const { title, company, location, from, to, current, description } = req.body;

    const newExp = { title, company, location, from, to, current, description };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift( newExp );

        await profile.save();

        res.status(200).json( profile );

    } catch (err) {
        res.status(500).send( err.message );
    }
})

// @route   Delete /profile/experience/:experience_id
// @desc    Delete experinece from profile
// @access  Private

router.delete('/experience/:id', auth, async(req, res ) =>{

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.experience.map( (item) => item._id )
                .indexOf( req.params.id);
        profile.experience.splice( removeIndex, 1);

        await profile.save();
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// @route   Put profile/education
// @desc    Add education to the users profile
// @access  Private

router.put('/addEducation', auth ,async( req,res) =>{

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    // console.log( req.body )
    const newInfo = { school, degree, fieldofstudy, from, to, current, description };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift( newInfo );

        await profile.save();

        res.status(200).json( profile );

    } catch (err) {
        res.status(500).send( err);
    }
})

// @route   Delete /profile/education/:experience_id
// @desc    Delete education from profile
// @access  Private

router.delete('/education/:id', auth, async(req, res ) =>{

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education.map( (item) => item._id )
                .indexOf( req.params.id);
        profile.education.splice( removeIndex, 1);

        await profile.save();
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// todo: github repo section see 4.9

router.get('/getGithubRepos/:username',( req,res) =>{
    // console.log( req.params.username );
    try {
        const options = {
            uri:` https://api.github.com/users/${ req.params.username }/repos?per_page=5&
                sort=created:asc&client_id=${ githubclientID }&client_secret=${githubclientSecret}`,
            method:'GET',
            headers:{'user-agent': 'node.js' }
        }

        request( options,( error, response, body) =>{
            if( error ) console.log( error )

            if( response.statusCode !== 200 ){
                return res.status(404).json({ msg:' No github profile found..!!' })
            }
            // console.log( JSON.parse( body ) )
            res.json( JSON.parse( body ));
        } )
        
    } catch (err) {
        res.status(500).json({ msg:' No github profile found..!!' })
    }
})

module.exports = router;