// This is where our main socket stuff will go
const io = require('../servers').io
const winston = require('winston')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log' })
    ]
})

const checkForOrbCollisions = require('./checkCollisions').checkForOrbCollisions
const checkForPlayerCollisions = require('./checkCollisions').checkForPlayerCollisions
// =========== CLASSES ===========
const Player = require('./classes/Player')
const PlayerData = require('./classes/PlayerData')
const PlayerConfig = require('./classes/PlayerConfig')
const Orb = require('./classes/Orb')
let players = []
let orbs = []
let settings = {
    defaultOrbs: 5000,
    defaultSpeed: 6,
    defaultSize: 6,
    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000
}

initGame()

// issue a message to every socket connected 30 fps
setInterval(() => {
    if (players.length > 0)
        io.to('game').emit('tock', {
            players
        })
}, 33)

io.sockets.on('connect', socket => {
    let player;
    // A player has connected
    socket.on('init', (data) => {
        // Add the player to the game namespace
        socket.join('game')
        // Make player object
        let playerConfig = new PlayerConfig(settings)
        // Maker a player data
        let playerData = new PlayerData(data.playerName, settings)
        // Make master to hold both
        player = new Player(socket.id, playerConfig, playerData)

        // issue a message to every socket connected 30 fps
        setInterval(() => {
            socket.emit('tickTock', {
                playerX: player.playerData.locX,
                playerY: player.playerData.locY
            })
        }, 33)

        socket.emit('initReturn', {
            orbs
        })
        players.push(playerData)
    })
    // The client sent over a tick. That means we know which direction to move the socket
    socket.on('tick', (data) => {
        speed = player.playerConfig.speed
        // Update the new playerConfig object with the new direction in data
        // and at the same time create local variable for this callback for readability
        xV = player.playerConfig.xVector = data.xVector;
        yV = player.playerConfig.yVector = data.yVector;

        if ((player.playerData.locX < 5 && player.playerConfig.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)) {
            player.playerData.locY -= speed * yV;
        } else if ((player.playerData.locY < 5 && yV > 0) || (player.playerConfig.locY > settings.worldHeight) && (yV < 0)) {
            player.playerData.locX += speed * xV;
        } else {
            player.playerData.locX += speed * xV;
            player.playerData.locY -= speed * yV;
        }

        // ORB COLLISION
        let capturedOrbs = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings)
        capturedOrbs.then(data => {
            const orbData = {
                orbIndex: data,
                newOrb: orbs[data]
            }

            io.sockets.emit('updateLeaderBoard', getLeaderBoard())
            //Emit to all sockets the orb to replace
            io.sockets.emit('orbSwitch', orbData)
        }).catch(() => { })
        // let dat = await checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings)
        // capturedOrbs.then()

        // PLAYER COLLISION
        let playerDeath = checkForPlayerCollisions(player.playerData, player.playerConfig, players, player.socketId)
        playerDeath.then(() => {
            io.sockets.emit('updateLeaderBoard', getLeaderBoard())
            io.sockets.emit('playerDeath', data)
        }).catch(() => { })
    })

    socket.on('disconnect', (data) => {
        // find out who just left... which player in players
        players.forEach((currPlayer, i) => {
            if (currPlayer.uid == player.playerData.uuid) {
                players.splice(i, 1)
                io.sockets.emit('updateLeaderBoard', getLeaderBoard())
            }
        })
    })
})

function getLeaderBoard() {
    //sort players in descending order
    players.sort((a, b) => {
        return b.score - a.score
    })
    let leaderBoard = players.map((currPlayer) => {
        return {
            name: currPlayer.name,
            score: currPlayer.score
        }
    })

    return leaderBoard
}

// Run at the beginning of every new game
function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings))

    }
}

module.exports = io