const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    name:{
        type:String
    },
    avtar:{
        type: String
    },
    text:{
        type:String,
        required: true
    },
    likes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required: true
            },
            name:{
                type:String
            },
            avtar:{
                type: String
            },
            text:{
                type:String,
                required: true
            },
            likes:[
                {
                    user:{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
                }
            ],
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],
    date:{
        type: Date,
        default: Date.now
    }
})

const Post = mongoose.model('Post',PostSchema);

module.exports = Post;