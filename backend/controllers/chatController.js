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


exports.create = async (req,res) =>{
    const {partnerID } = req.body


    //creating a pg transaction to avoid orphan data
    const transac = await sequelize.transaction();

    try{
        //if users already have a chat, don't create another
        
        const user = await User.findOne({
            where: {
                id: req.user.id
            },
            include: [
                {
                    model: Chat,
                    where:{
                        type: 'dual'
                    },
                    include:[
                        {
                            model: ChatUser,
                            where:{
                                userId: partnerID
                            }
                        }
                    ]
                }
            ]
        })
        console.log("got user back : ", user);
        if(user && user.Chats.length > 0) {
            //user chats exists , so forbidding the creation of chat
            console.log("user alrady has chat with partner")

            return res.status(403).json({status:"Error",message:'Chat already exists'});
        }
        
        
        const chat = await Chat.create({type:'dual'},{transaction: transac});

        console.log("\n** CHAT CREATED  with id**\n",chat.id);

        await ChatUser.bulkCreate([
            {
                chatId: chat.id,
                userId: req.user.id
            },
            {
                chatId: chat.id,
                userId: partnerID
            }
        ],{transaction:transac})
        
        //getting the new chat to send as response,
        const chatId = chat.id;
        console.log("getting chatRes for chatId: " ,chatId);
        
        const chatRes = await Chat.findOne({
            where: {
                id: chatId
            },
            include : [
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
                    
                }
            ]
        });

        await transac.commit();

        console.log("created a new chat", chatRes);
        
        return res.send(chatRes);

    }
    catch(e){
        await transac.rollback();
        return res.status(500).json({status:'Error', message:e.message});
    }
};

exports.getRes = async (req,res) =>{

    const {chatId } = req.body
        
        //getting the new chat to send as response,
    try{
        const chatRes = await Chat.findOne({
            where: {
                id: chatId
            },
            include : [
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
                    
                }
            ]
        });



        console.log("created a new chat", chatRes);
        
        return res.send(chatRes);

    }
    catch(e){
        return res.status(500).json({status:'Error', message:e.message});
    }

}