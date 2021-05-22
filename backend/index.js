const express = require('express');

const router = require('./router/index');
const config = require('./config/app')


const app = express();

const port = config.appPort;
app.use(router)


app.get('/',(req,res)=>{
    return res.send("Hello, express")
})



app.listen(port,()=>{
    console.log(`Express server started, listening on port ${port}`)
})

