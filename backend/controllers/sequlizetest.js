const models = require('../models');
//getting all models
const User = models.User
const Chat = models.Chat
const ChatUser = models.ChatUser
const Message = models.Message


const { Op } = require('sequelize');
const { sequelize } = require('../models');

const chatid = 23;

const userid = 25;

async function findChatRes(chatid,userid){
    const chatRes = Chat.findOne({
        where: {
            id: chatid
        },
        include : [
            {   
                //for each chat grab all users except the above user
                model: User,
                where: {
                    [Op.not]:{
                        id: 25
                    }
                }
            },
            //grab all the messages betwee nusers
            {
                model: Message,
                limit: 20
            }
        ]
    })

    return chatRes;

}
console.log(findChatRes(chatid,userid));