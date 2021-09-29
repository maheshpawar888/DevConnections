const express = require('express');
require('./DB/connect')
const userRouter = require('./routes/user');
const profile = require('./routes/profile');
const authRoute = require('./routes/auth')

const app = express();

// Initiating body parser
app.use( express.json() );

app.use('/users', userRouter);
app.use('/profile',profile);
app.use('/auth', authRoute);
app.use('/post',require('./routes/Post'))

app.get('/', (req,res) =>{
    res.json('hii');
})

const PORT = process.env.PORT || 5000;

app.listen( PORT, () =>{
    console.log(`Server is started on ${PORT}`)
})