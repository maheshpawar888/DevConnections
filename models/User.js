const mongoose = require('mongoose');
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate( value ){
            if( !validator.isEmail( value )){
                throw new Error('Invalid Email given!')
                // return res.json({ msg:'Invalid Email given!' })
            }
        }
    },
    password: {
        type: String,
        required: true,
        // minLength: 8,
        validate(value){
            if( value.length < 8){
                throw new Error('Password must be 8 charaters long..!')
            }
        }
    },
    avtar:{
        type: String,
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

const User = mongoose.model('User',userSchema);

module.exports = User;