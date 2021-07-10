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


exports.searchUsers = async (req,res)=>{


    try{
        console.log("searching from usercontroller " , req.query, "id: ",req.user.id);
        try{
            const users = await User.findAll({
                where: {
                    [sequelize.Op.or] :{
                        namesConcated: sequelize.where(
                            sequelize.fn('CONCAT',sequelize.col('firstname'), ' ', sequelize.col("lastname")),
                            {
                                [sequelize.Op.substring]: `${req.query.term}`
                            }
                        ),
                        email:{
                            [sequelize.Op.substring] :  `${req.query.term}`
                        }
                    },
                    [sequelize.Op.not]: {
                        id : req.user.id
                    }
                },
                limit:10
            });


            console.log("from userController, search users" ,users);
            return res.json(users);
        }
        catch(e){

            console.log("error from search db call",e);
        }   
        

    }
    catch(error){
        return res.status(601).json({"error":error})
    }
}