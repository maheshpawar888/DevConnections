const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @api  /auth/
// return an user if exists. 
router.get('/',auth,async(req, res) =>{
    
    try{
        const user = await User.findById( req.user.id ).select("-password");
        res.json( user )
    }catch(err){
        res.status(500).json(err)
    }
})

// @api  /auth/login
// @desc login user by email and pass.
router.post('/login',async(req,res) =>{
    const { email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if( !user ){
            return res
                .status(401)
                .json({ msg: "Invalid Credentials..!!"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if( !isMatch ){
            return res
                .status(401)
                .json({ msg: "Invalid Credentials..!!"})
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(payload, "mysecretkey", {expiresIn:36000});
        res.status(200).json({token});

    }catch(err){
        res.status(500).json(err)
    }
})

module.exports = router;