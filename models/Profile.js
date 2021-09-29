const mongoose = require('mongoose');
const validate = require('validator');

const ProfileSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    company:{
        type:String
    },
    website:{
        type:String
    },
    location:{
        type:String
    },
    status:{
        type:String,
        required:true,
        validate( value ){
            if( !value){
                // return res.status(400).json({'msg':' status is required..!!'})
                throw new Error('status is required..!')
            }
        }
    },
    skills:{
        type:[String],
        required:true,
        validate( value ){
            if( value.length === 0){
                return res.status(400).json({'msg':' skills are required..!!'})
            }
        }
    },
    bio:{
        type:String,
    },
    githubusername:{
        type:String
    },
    experience:[
        {
            title:{
                type:String,
                required:true
            },
            company:{
                type:String,
                required:true
            },
            location:{
                type:String
            },
            from:{
                type: Date,
                required: true
            },
            to:{
                type:Date,
            },
            current:{
                type: Boolean,
                default: false
            },
            description:{
                type: String
            }
        }
    ],
    education:[
        {
            school:{
                type:String,
                required: true
            },
            degree:{
                type:String,
                required: true
            },
            fieldofstudy:{
                type:String,
                required: true
            },
            from:{
                type: Date,
                required: true
            },
            to:{
                type:Date,
            },
            current:{
                type: Boolean,
                default: false
            },
            description:{
                type: String
            }
        }
    ],
    social:
        {
            youtube:{
                type: String
            },
            twitter:{
                type: String
            },
            facebook:{
                type: String
            },
            linkedin:{
                type: String
            },
            instagram:{
                type: String
            }
        },
    date:{
        type: Date,
        default: Date.now
    }
});

const Profile = mongoose.model('Profile',ProfileSchema);
module.exports = Profile;