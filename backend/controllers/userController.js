//for controlling user  updates

const User = require('../models').User;

const sequelize = require('sequelize');

exports.updateFunc = async (req,res) => {

    try{
        
        const [ rows ,result] = await User.update( req.body,
            {
                where : {
                    id : req.user.id
                },
                returning : true,
                individualHooks : true,
            }
        )

        //raw to get user object and not sequelize instance
        const user = result[0].get({raw: true});
        delete user.password;
        return res.send(user);


    }
    catch (e) {
        return res.status(500).json({error: e.message})
    }
}