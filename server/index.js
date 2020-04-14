const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUser, getUsersInRooms } = require('./users');
const PORT = process.env.PORT || 5000;

const router = require('./router');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    socket.on('join', ({ name, room},callback) => {
        const { user, error } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${user.name} welcome to the ${user.room}!` });
        socket.broadcast.to(user.room).emit('message', { user: "admin", text: `${user.name}, has joined!` });

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room:user.room,users:getUsersInRooms(user.room)});
        // socket.on('users',({names:[]})=>{
        //     const user = getUser(socket.id);
        //     names.push(user);
        // })
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { user: user.room, users:getUsersInRooms(user.room) });
        console.log("asdasd ",user.room);

        callback();
    });


    socket.on('disconnect', () => {
        const user  = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left!`})
        }
    })
});


app.use(router);

server.listen(PORT, () => console.log(`server has started on port ${PORT}`));




