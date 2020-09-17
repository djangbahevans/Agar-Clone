// Sets up Express and Socket.io servers
const express = require('express')
const app = express();
app.use(express.static(__dirname + '/public'));
const socketio = require('socket.io')
const helmet = require('helmet')
app.use(helmet())
const expressServer = app.listen(8080);
const io = socketio(expressServer)

module.exports = {
    app,
    io
}