const { Room, User } = require('./schemas.js');

async function socket_setup(socket){
    const user = await User.findOne({user: socket.request.session.username});
    let room = null;
    socket.on('identify', async (roomid) => {
        room = await Room.findById(roomid);
        if(!room){
            socket.disconnect();
        }
        if(!room.users.includes(user._id)){
            room.users.push(user._id);
            await room.save();
            socket.to(roomid).emit('newUser', user);
        }
        socket.join(roomid);
        if(room.users.length === 4){
            socket.to(roomid).emit('startGame');
            socket.emit('startGame');
        }
    });
    socket.on('startRequest', () => {
        if(room.users.includes(user._id) && room.users.length > 1){
            socket.to(room._id).emit('startGame');
            socket.emit('startGame');
        }
    })
}

module.exports = socket_setup;
