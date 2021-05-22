//login  and register controllers for authenticating a user

const bcrypt = require('bcrypt');
const User = require('../models').User;
const jwt = require('jsonwebtoken');



const generateToken = (user) =>{
    //console.log('User to authenticate' ,user);
    delete user.password;
    const token = jwt.sign(user,'secret',{expiresIn : 86400});
    user['token'] = token;
    return user;
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //find the user in database
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

        console.log(user);
        const plainUserObj = user.get({raw : true})
        //const userWithToken = generateToken(user); user is complex object, only plain obj allowed
        const userWithToken = generateToken(plainUserObj);
        return res.send(userWithToken);

    }
    catch (error) {
        return res.status(500).json({"Error":`${error} User email already exists! Try another email`})
    }

};