const jwt = require('jsonwebtoken');
const config = require('../config/app')
//for authorizing token from user
exports.authToken = (req,res,next)=>{

    const authHeader = req.headers['authorization'];
    const token = (authHeader) && authHeader.split( ' ' )[1];
    
    //if not token is retrieved
    if(!token){
        return res.status(401).json({error: "missing token /from middleware/authToken"})
    } 

    jwt.verify(token,config.appKey,(err,user)=>{
        if(err) return res.status(401).json({error: err});
        req.user = user
    })

    console.log("from autToken validaton" , authHeader);
    next();

}
