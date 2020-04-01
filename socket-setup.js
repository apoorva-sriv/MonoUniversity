const { Room, User } = require('./schemas.js');

async function socket_setup(socket){
    const user = await User.findOne({user: socket.request.session.username})
    socket.on('identify', async (roomid) => {
        const room = await Room.findById(roomid);
        if(!room.users.includes(user._id)){
            room.users.push(user._id);
            await room.save();
            socket.to(roomid).emit('newUser', user);
        }
        socket.join(roomid);
        if(room.users.length == 4){
            socket.to(roomid).emit('startGame');
            socket.emit('startGame');
        }
    });
    socket.on('startRequest', async (roomid) => {
        const room = await Room.findById(roomid);
        if(room.users.includes(user._id) && room.users.length > 1){
            socket.to(roomid).emit('startGame');
            socket.emit('startGame');
        }
    })
}

module.exports = socket_setup;
