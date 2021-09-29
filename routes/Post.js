const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

// @route   POST '/'
// @desc    Add Post
// @access  Private
router.post('/', auth, async(req, res) =>{

    try {
            const user = await User.findById( req.user.id ).select('-password');

            let post = new Post({
                text: req.body.text,
                name: user.name,
                avtar: user.avtar,
                user: req.user.id
            })

            post = await post.save();

            res.status(200).json( post );

    } catch (err) {
        res.status(500).send(err);
    }
})

// @route   get '/'
// @desc    get all Posts
// @access  Private
router.get('/', auth, async(req, res)=>{
    try {
        const posts = await Post.find().sort({date : -1});
        res.json( posts );
    } catch (err) {
        res.status(500).send( err.message )
    }
})

// @route   get '/:post_id'
// @desc    get Post by id
// @access  Private
router.get('/:id', auth, async(req, res)=>{
    try {
        const post = await Post.findById( req.params.id );

        if( !post ){
            return res.json({ msg: 'No Post Found..!!' })
        }
        res.json( post );
    } catch (err) {

        if( err.kind == 'ObjectId '){
            return res.json({ msg: 'No Post Found..!!' })
        }
        res.status(500).send( err.message )
    }
})

// @route   delete '/:post_id'
// @desc    delete Post by id
// @access  Private
router.delete('/:id', auth, async(req, res)=>{
    try {
        const post = await Post.findById( req.params.id );

        if( !post ){
            return res.json({ msg: 'No Post Found..!!' })
        }

        if( post.user.toString() !== req.user.id ){
            return res.status(401).json({ msg: 'you are not authorized..!!' })
        }

        await post.remove();

        res.json( "post removed successfully..!!" );
    } catch (err) {

        if( err.kind == 'ObjectId '){
            return res.json({ msg: 'No Post Found..!!' })
        }
        res.status(500).send( err.message )
    }
})

// @route   put '/post/like/:id'
// @desc    like to Post
// @access  Public
router.put('/like/:id',auth, async(req, res)=>{
    try {
        const post = await Post.findById( req.params.id );

        if( post.likes.filter( (like) =>like.user.toString() === req.user.id ).length > 0 ){
            return res.status(400).json({ msg:'This post is already liked..!!'})
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();

        res.json( post.likes );
    } catch (err) {
        res.status(500).json(err.message)
    }
})

// @route   put 'post/unlike/:id'
// @desc    unlike to Post
// @access  Public
router.put('/unlike/:id',auth, async(req, res)=>{
    try {
        const post = await Post.findById( req.params.id );

        // check if the post is liked or not
        if( post.likes.filter( (like) =>like.user.toString() === req.user.id ).length === 0 ){
            return res.status(400).json({ msg:'This post has not yet been liked..!!'})
        }
        // find the index of the user
        const index = post.likes.filter( (like) =>like.user.toString() ).indexOf( req.user.id )

        post.likes.splice(index, 1);
        await post.save();

        res.json( post.likes );
    } catch (err) {
        res.status(500).json(err.message)
    }
})

// @route   POST 'post/comment/:id'
// @desc    comment post
// @access  Private

router.post('/comment/:id', auth, async(req, res) =>{
    try {
        
        const user = await User.findById( req.user.id ).select('-password');
        const post = await Post.findById( req.params.id );

        const newComment = {
            user: req.user.id,
            name: user.name,
            avtar: user.avtar,
            text: req.body.text
        }

        post.comments.unshift( newComment );

        await post.save();

        res.json( post.comments );

    } catch (err) {
        res.status(500).json( err.message )
    }
})

// @route   delete 'post/comment/:post_id/:comment_id'
// @desc    delete comment
// @access  Private
router.delete('/comment/:pid/:cid', auth, async( req, res)=>{
    try {
        
       const post = await Post.findById( req.params.pid );

       const comment = post.comments.find( 
           ( comment ) => comment.id === req.params.cid 
        );

        // Make sure the comment exists
        if( !comment ){
            return res.status(404).json({
                msg: 'Comment does not exists..!!'
            })
        }

        // check user
        if( comment.user.toString() !== req.user.id){
            return res.status(401).json({
                msg: 'you are not authorised..!! '
            })
        }

        // get an index of comment that we want to remove
        const index = post.comments.map( comment => comment.id).indexOf( req.params.cid );

        post.comments.splice(index, 1);
        await post.save();
        res.json( post.comments );
    } catch (err) {
        res.status(500).send( err.message );
    }
})

module.exports = router;