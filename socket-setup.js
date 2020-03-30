const { Room, User } = require('./schemas.js');

async function socket_setup(socket){
    console.log(socket);
    const user = await User.findOne({user: socket.request.session.username})
    socket.on('identify', async (roomid) => {
        const room = await Room.findById(roomid);
        if(!room.users.includes(user._id)){
            room.users.push(user._id);
            await room.save();
            socket.to(roomid).emit('newUser', user);
        }
        socket.join(roomid);
    })
}

module.exports = socket_setup;
