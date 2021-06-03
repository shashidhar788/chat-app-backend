const models = require('../models');
//getting all models
const User = models.User
const Chat = models.Chat
const ChatUser = models.ChatUser
const Message = models.Message

const { Op } = require('sequelize');
const { sequelize } = require('../models');


exports.index = async (req,res) =>{
    //querying the user table where id is specified id
    //reutrns 
    const user = await User.findOne({
        where : {
            id: req.user.id
        },
        include: [
            {   //grabbing all chats associated with this user
                model: Chat,
                include: [
                    {   
                        //for each chat grab all users except the above user
                        model: User,
                        where: {
                            [Op.not]:{
                                id: req.user.id
                            }
                        }
                    },
                    //grab all the messages betwee nusers
                    {
                        model: Message,
                        limit:20,
                        order:[['id','DESC']]
                    }
                    
                ]
            }
        ]
    }
    );

    //return 
    return res.send(user.Chats);
}
