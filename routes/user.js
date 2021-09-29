const express = require('express');
const router = express.Router();
const User = require('../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator')

// @desc  :register user 
router.post('/register',[
  check('name','Name is required..!!').not().isEmpty(),
  check( 'email','Please include a valid Email..!!' ).isEmail(),
  check('password','Please enter a pasword with 8 or more characters').isLength({ min:8 })
],async(req, res) =>{

    const errors = validationResult( req );

    if( !errors.isEmpty() ){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password} = req.body
    try{

        const registered = await User.findOne({ email });

        if( registered ){
            return res.status(400).json({ errors: [{  msg: 'Email already registered..!' }]})
        }

        const avtar = gravatar.url(email,{
            s: '200',
            r: 'pg',
            d: 'mm'
        });
        
        let user = new User({
            name,
            email,
            password,
            avtar
        });

        user.password = await bcrypt.hash( password, 8);        
        await user.save();

        const payload = {
            user:{
                id: user.id
            }
        }

        const token = jwt.sign(payload, "mysecretkey",{ expiresIn: 36000 });
        res.status(200).json({
            token
        })
    }catch(e){
        console.log( e );
        res.status(400).json(e);
    }
})

module.exports = router;