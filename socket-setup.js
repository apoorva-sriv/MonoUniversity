const { Room, User, Board } = require("./schemas.js");
const boardutils = require("./board-logic.js");

async function socket_setup(socket) {
    const user = await User.findOne({ user: socket.request.session.username });
    let room = null;
    let board = null;
    function initBoard() {
        board = new Board();
        boardutils.readyBoard(board, room.users);
        board.save().then(() => {
            socket.to(room._id).emit("startGame", board._id);
            socket.emit("startGame", board._id);
        });
    }

    socket.on("identify", async roomid => {
        room = await Room.findById(roomid);
        if (!room) {
            return socket.disconnect();
        }
        if (!room.users.includes(user._id) && !room.start) {
            room.users.push(user._id);
            await room.save();
            socket.to(roomid).emit("newUser", user);
        }
        socket.join(roomid);
        socket.emit("identifyAccept");
        if (room.users.length === 4) {
            initBoard();
        }
    });
    socket.on("startRequest", () => {
        if (!room) return;
        if (room.users.includes(user._id) && room.users.length > 1) {
            initBoard();
        }
    });
    socket.on("leave", async () => {
        if (!room) return;
        room.users.remove(user._id);
        await room.save();
        socket.to(room._id).emit("playerLeave", user._id);
        socket.disconnect();
        Room.findByIdAndDelete(room._id);
    });
}

module.exports = socket_setup;
