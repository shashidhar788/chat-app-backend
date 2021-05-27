//login  and register controllers for authenticating a user

const bcrypt = require('bcrypt');
const User = require('../models').User;
const jwt = require('jsonwebtoken');
const cofig = require('../config/app');




const generateToken = (user) =>{
    //console.log('User to authenticate' ,user);
    delete user.password;
    //we sign  the token with a appkey that we generate
    const token = jwt.sign(user,cofig.appKey,{expiresIn : 86400});
    user['token'] = token;
    return {...{user},...{token}};
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //find the user in database

        const secret = require('crypto').randomBytes(64).toString('hex');
        // e1d415f47d5b1485a92ee112c1dd6c169c25619d7d0ab636abf9b58482acc1a9ac2108517b3a88b0c60ed48bff258e6903bddf4f2f3412e24081db6fc6d64fd3
        const user = await User.findOne({
            //find the first user where the email matches the given email
            where: {
                email: email
            }
        });

        //check if user in present in database

        if (!user) {
            return res.status(404).json({ "message": "User not found" })
        }

        //check if the password mathces the database
        //we compare using the bcrypt comapareSync method

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ "message": "Incorrect password" });
        }

        //if password matches,generate the auth token for the user
        const plainUserObj = user.get({raw : true})

        //const userWithToken = generateToken(user); user is complex object, only plain obj allowed
        const userWithToken = generateToken(plainUserObj);
        return res.send(userWithToken);

    }
    catch (error) {
        return res.status(500).json({"Error":`${error} Please contact the admin to resolve`})
    }


};

exports.register = async (req, res) => {
    
    try {
        const user = await User.create(req.body)
        // use pass hasing is usermodel using hooks
        console.log(user);
        const plainUserObj = user.get({raw : true})
        //const userWithToken = generateToken(user); user is complex object, only plain obj allowed
        const userWithToken = generateToken(plainUserObj);
        return res.send(userWithToken);

    }
    catch (error) {
        if(error.message==="Validation error"){
            return res.status(500).json({"Error" : `${error}. Email already exists, please try with another email` })
        }
        return res.status(500).json({"Error":`${error.message}`})
    }

};