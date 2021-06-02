const express = require('express');
//const bodyparser = require('body-parser');
const router = require('./router/index');
const config = require('./config/app')
const cors = require('cors');

const app = express();

const port = config.appPort;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
  }));

app.use(router)

app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/uploads'));

app.get('/',(req,res)=>{
    return res.send("Hello, express")
})



app.listen(port,()=>{
    console.log(`Express server started, listening on port ${port}`)
})

