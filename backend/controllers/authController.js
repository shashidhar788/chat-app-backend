//login  and register controllers for authenticating a user

const bcrypt = require('bcrypt');
const User = require('../models').User;



exports.login = async (req,res)=>{
    const {email,password} = req.body;

    
    try{
        //find the user in database
        const user = await User.findOne({
            //find the first user where the email matches the given email
            where:{
                email : email 
            }
        });

        //check if user in present in database

        if(!user){
            return res.status(404).json({"message":"User not found"})
        }

        //check if the password mathces the database
        //we compare using the bcrypt comapareSync method

        if(!bcrypt.compareSync(password,user.password)){
            return res.status(401).json({"message":"Incorrect password"});
        }
        
        //if password matches,generate the auth token for the user
        

        return res.send(user)

    }
    catch (error) {
    }

    return res.send(user);
    
};

exports.register = async (req,res)=>{
    return res.send("Registration screen")
};