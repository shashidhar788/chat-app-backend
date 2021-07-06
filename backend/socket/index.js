const socketIO = require('socket.io');
const { sequelize } = require('../models')
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

            io.to(socket.id).emit('typing', 'Typing.....')

        })

        socket.on('disconnect', async () => {
            //we need to find which user disconnected

            /* users.socket.forEach((user,key)=>{
                user.sockets.forEach
            }) */

            console.log(" from socket a user disconnected : ");

            if (userSockets.has(socket.id)) {
                const user = users.get(userSockets.get(socket.id));

                if (user.sockets.length > 1) {

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

        })

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