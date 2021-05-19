const express = require('express');
const config = require('./config/app')


const app = express();

const port = config.appPort;

app.get('/',(req,res)=>{
    return res.send("Hello, express")
})

app.get('/login',(req,res)=>{
    console.log("login screen requested")
    return res.send('Login Screen')
})

app.listen(port,()=>{
    console.log(`Express server started, listening on port ${port}`)
})

