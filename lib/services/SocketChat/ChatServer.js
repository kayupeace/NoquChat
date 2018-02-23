var SocketChat = require(__base + 'lib/services/SocketChat/ChatComponent');

var chatServer = function(server) {
//var http = require('http').Server(app);
    var io = require('socket.io').listen(server);

    io.on('connection', function (socket) {

        // New Message Event
        SocketChat.NewMessage(socket, io);

        // New User Event and disconnecting event
        SocketChat.NewUser(socket, io);

        // Typing and Stop Typing Event
        SocketChat.UserTyping(socket, io);

        /**
        socket.on('new room', function (newroom) {
            socket.join(newroom);
            socket.room = newroom;

            io.sockets.in(newroom).emit("user joined", {
                username: socket.username,
                numUsers: numUsers
            });
        });

        socket.on("new action", function (data){
            let action = data.action;

        });
         **/
        /**
        socket.on('switchRoom', function(newroom){
            // leave the current room (stored in session)
            if(socket.room) {
                socket.leave(socket.room);
            }
            // join new room, received as function parameter
            socket.join(newroom);
            //socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
            // sent message to OLD room
            //socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
            // update socket session room title
            socket.room = newroom;
            //socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
            //socket.emit('updaterooms', rooms, newroom);
        });
         **/


    });
};

module.exports = {
    chatServer: chatServer
};