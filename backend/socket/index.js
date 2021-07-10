const socketIO = require('socket.io');
const { sequelize } = require('../models')

const Message = require('../models').Message
//track all the online users
const users = new Map(); // key : user id , value : { id , sockets[] }

const userSockets = new Map();

const SocketServer = (server) => {

    const io = socketIO(server, {
        //fixing cors here
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        
        socket.on('join', async (user) => {
            //keep track of user sockets
            var sockets = [];

            //check if user is already in [for multiple device logins]
            if (users.has(user.id)) {
                const existingUser = users.get(user.id);
                existingUser.sockets = [...existingUser.sockets, ...[socket.id]] //updating to use ids
                users.set(user.id, { id: user.id, sockets: [socket.id] })
                sockets = [...existingUser.sockets, ...[socket.id]];

                userSockets.set(socket.id, user.id);
            } else {

                //create new user in map 
                users.set(user.id, { id: user.id, sockets: [socket.id] })
                sockets.push(socket.id);
                userSockets.set(socket.id, user.id);
            }

            //keeping tarck of the friends online
            const onlineFriends = []

            //query the database to get all the chats this user has


            const chatters = await getChatters(user.id);

            console.log("the query result for chatters, socket", chatters)
            
            //notifiying his frineds that user is online

            for (let i = 0; i < chatters.length; i++) {
                if (users.has(chatters[i])) {
                    const chatter = users.get(chatters[i])
                    chatter.sockets.forEach(socket => {
                        try {
                            io.to(socket).emit('online', user);

                        }
                        catch (e) {
                            console.log(e);
                        }
                    })

                    onlineFriends.push(chatter.id);
                }
            }

            // seding to the current user the friends that are online

            sockets.forEach(socket => {
                try {
                    io.to(socket).emit('friendsOnline', onlineFriends);

                }
                catch (e) {
                    console.log(e);
                }
            })

            console.log(" from socket new user joined : ", user.firstname);

            console.log("the users " , users);
            console.log("users map",userSockets);
            

            io.to(socket.id).emit('typing', 'Typing.....')

        })

        //message event from front end

        socket.on('message', async (message)=>{
            console.log("got a messge to socket from user", message);
            //store the sockets to send the message
            let sockets = []; 

            if(users.has(message.fromUser.id)){
                sockets = users.get(message.fromUser.id).sockets
            }
            //get all the sockets to send the message to
            message.toUserId.forEach(id=>{
                if(users.has(id)){
                    sockets = [...sockets,...users.get(id).sockets];
                }
            });
            //now send the message to each socket
            try{
                //to store the object in message table
                const msg = {
                    type: message.type,
                    fromUserId: message.fromUser.id,
                    chatId: message.chatId,
                    message:message.message
                }
                //storing the message to Message table in postgres
                const savedMessage = await Message.create(msg);

                message.User = message.fromUser;
                message.fromUserId = message.fromUser.id
                message.message = savedMessage.message;
                delete message.fromUser

                sockets.forEach(socket=>{
                    io.to(socket).emit('received',message);
                })

            }catch(e){

            }

        })

        socket.on('add-friend', (chats) => {
            try {
                console.log("from sockets chats debug", chats[0].Users);
                let onlineStatus = 'offline';
                if (users.has(chats[1].Users[0].id)) {
                    onlineStatus = 'online';
                    chats[1].Users[0].status = 'online';

                    users.get(chats[1].Users[0].id).sockets.forEach(socket => {
                        io.to(socket).emit('new-chat', chats[0]);
                    })
                }


                if (users.has(chats[0].Users[0].id)) {

                    chats[0].Users[0].status = onlineStatus;

                    users.get(chats[0].Users[0].id).sockets.forEach(socket => {
                        io.to(socket).emit('new-chat', chats[1]);
                    })

                }
            }
            catch (err) {

                console.log(err);
            }
        })


        socket.on('disconnect', async () => {
            //we need to find which user disconnected

            /* users.socket.forEach((user,key)=>{
                user.sockets.forEach
            }) */

            console.log(" from socket a user disconnected : ");

            //adding try catch as user sockets are deleted when disocnnected from all the devices
            try{
            if (userSockets.has(socket.id)) {
                const user = users.get(userSockets.get(socket.id));
                // delte all the user sockets
                if (user&& user.sockets.length > 1) {

                    user.socket = user.sockets.filter(sock => {

                        if (sock != socket.id) return true;

                        userSockets.delete(sock);

                        return false;
                    })

                    users.set(user.id, user)
                } else {

                    const chatters = await getChatters(user.id);
                    //notifying user that his friends are offline
                    for (let i = 0; i < chatters.length; i++) {
                        if (users.has(chatters[i])) {
                            const chatter = users.get(chatters[i])
                            chatter.sockets.forEach(socket => {
                                try {
                                    io.to(socket).emit('offline', user);

                                }
                                catch (e) {
                                    console.log(e);
                                }
                            })

                        }
                    }
                    userSockets.delete(socket.id);
                    users.delete(user.id);


                }
            }
            }catch(e){
                console.log(e);
            }

        });

    })
}

//find all the users that the current user is chatting with
const getChatters = async (userId) => {
    try {
        const [results, metadata] = await sequelize.query(`
        SELECT "cu"."userId" from "ChatUsers" as cu
        INNER JOIN (
            SELECT "c"."id" from "Chats" as c
            WHERE EXISTS (
                SELECT "u"."id" FROM "Users" as u
                INNER JOIN "ChatUsers" on u.id = "ChatUsers"."userId"
                WHERE u.id = ${parseInt(userId)} and c.id = "ChatUsers"."chatId"
            )
        ) AS cjoin on cjoin.id = "cu"."chatId"
        WHERE "cu"."userId" !=${parseInt(userId)}
        `
        )

        return results.length > 0 ? results.map(e => e.userId) : []
    }
    catch (e) {
        console.log("error from socket get chatters", e)
        return [];
    }
}


module.exports = SocketServer;