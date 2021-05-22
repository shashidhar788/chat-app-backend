const router = require('express').Router();

const config = require('../config/app');



router.post('/login',(req,res)=>{
    return res.send("Login screen")
})


router.post('/register',(req,res)=>{
    return res.send("Registration screen")
})



module.exports = router;