const jwt = require('jsonwebtoken');
const config = require('../config/app')
//for authorizing token from user
exports.authToken = (req,res,next)=>{
    try{

    
    const authHeader = req.headers['authorization'];
    const token = (authHeader) && authHeader.split( ' ' )[1];
    
    //if not token is retrieved
    if(!token){
        return res.status(401).json({error: "missing token /from middleware/authToken"})
    } 

    jwt.verify(token,config.appKey,(err,user)=>{
        
        if(err){
            return res.status(401).json({error:err,'message':"error in authToken.js solve the server crash"});
            //return res.status(401).json({error: err});
            
        }else{
            req.user = user
        } 

        
    });

    console.log("from autToken validaton" , authHeader);
    next();
    }
    catch(e){
        console.log("from autToken validaton" , e);
        return ;
    }


}
