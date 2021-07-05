const socketIO = require('socket.io');

const SocketServer = (server) => {

    const io = socketIO(server);

    io.on('connection', (socket)=>{
        socket.on('join',  async (user)=>{

            console.log(" from socket new user joined : " , user.firstname)
        
        })
        
    }) 
}


module.exports = SocketServer;