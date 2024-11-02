const express = require("express");
const cors = require("cors");
const app = express();
const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});

const gridRows = 100
const gridCols = 100

app.use(cors({ origin: 'http://localhost:3001' }));

console.log("Server is running");

app.use(express.static('public'));

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST']
    }
});

let connections = 0

const maxPlayers = 4

let rooms = new Map();
let socketNames = new Map();
let socketRooms = new Map();
let roomGridData = new Map();

io.sockets.on('connection', (socket) => {
    console.log('new connection ' + socket.id);
    connections++;
    console.log("number of connections: " + connections);

    socket.on('new name', (name) => {
        socketNames.set(socket.id, name);
        console.log(socketNames)
    });

    socket.on('create or join', (room) => {
        // numClients = io.of('/').in(room).clients;
        let numClients;
        if (rooms.get(room) == undefined) {
            numClients = 0;
        } else {
            numClients = rooms.get(room).length;
        }
        console.log("user joining the room");
        console.log(numClients);

        if (numClients === 0) {
            rooms.set(room, [socketNames.get(socket.id)]);
            socket.join(room);
            socketRooms.set(socket.id, room);
            socket.emit('created', room);
        } else if (numClients < maxPlayers) {
            let name = socketNames.get(socket.id)
            socket.emit('joined', room, rooms.get(room), maxPlayers);
            rooms.get(room).push(name)
            // io.sockets.in(room).emit('join', room);
            socket.join(room);
            socketRooms.set(socket.id, room);
            io.to(room).emit('otherjoined', name);
        } else {
            socket.emit("full", room)
        }

        console.log(socketRooms)
        console.log(rooms)
    });

    socket.on('start game', (room) => {
        let name = socketNames.get(socket.id)
        if (rooms.get(room)[0] == name) {
            console.log("Game Start")

            let grid = []

            for (let r = 0; r < gridRows; r++) {
                let row = []
                for (let c = 0; c < gridCols; c++) {
                    row.push('empty')
                }
            }

            roomGridData.set(room, grid)


            io.to(room).emit('start game', grid)
        }
    });

    socket.on('leave room', (room) => {
        socketRooms.delete(socket)
        socket.leave(room)
    })

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        connections--;
        console.log("number of connections: " + connections);
        if (socketNames.has(socket.id)) {
            let name = socketNames.get(socket.id);
            socketNames.delete(socket.id)
            if (socketRooms.has(socket.id)) {
                let room = socketRooms.get(socket.id);
                io.to(room).emit('otherleft', name);
                if (rooms.has(room)) {
                    rooms.get(room).splice(room.indexOf(name), 1);
                    socketRooms.delete(socket.id);
                    if (rooms.get(room).length == 0) {
                        rooms.delete(room)
                    }
                }
            }
        }
        console.log(socketNames);
    });
})
