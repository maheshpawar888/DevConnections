const mongoose = require('mongoose');
// const config = require('config');
// const url = config.get('mongodbURI');

mongoose.connect("mongodb://localhost/devconnections",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false ,
    useCreateIndex: true
}).then( () =>{
    console.log('Mongodb Connected successfully..!!')
  })
  .catch( (e)=>{
    console.log("error: ",e)
  })