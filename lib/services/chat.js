
var chatServer = function(server) {
//var http = require('http').Server(app);
    var numUsers = 0;
    var io = require('socket.io').listen(server);

    io.on('connection', function (socket) {
        var addedUser = false;
        var rooms = ['room1','room2','room3']; //should be database

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            // we tell the client to execute 'new message'
            //socket.broadcast.emit('new message', {
            //socket.broadcast.emit(socket.room, {
            //    username: socket.username,
            //    message: data
            //});
            io.sockets.in(socket.room).emit("new message", {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', function (username) {
            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            socket.room = 'room1';
            socket.join('room1');
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', function () {
            //socket.broadcast.emit('typing', {
            //    username: socket.username
            //});

            io.sockets.in(socket.room).emit("typing", {
                username: socket.username
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', function () {
            //socket.broadcast.emit('stop typing', {
            //    username: socket.username
            //});
            io.sockets.in(socket.room).emit("stop typing", {
                username: socket.username
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
            //delete usernames[socket.username];
            //delete usernames[socket.room];
            socket.leave(socket.room);
        });

        // switch room
        socket.on('switchRoom', function(newroom){
            // leave the current room (stored in session)
            socket.leave(socket.room);
            // join new room, received as function parameter
            socket.join(newroom);
            //socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
            // sent message to OLD room
            //socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
            // update socket session room title
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
            //socket.emit('updaterooms', rooms, newroom);
        });


    });



};


module.exports = {
    chatServer: chatServer
};