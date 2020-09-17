// This is all the data that everyone needs to know
// const uuid = require('uuid/v4')
const uuidv4 = require('uuid/dist/v4').default


class PlayerData {
    constructor(playerName, settings) {
        this.uuid = uuidv4()
        this.name = playerName
        this.locX = Math.floor(settings.worldWidth * Math.random() + 10)
        this.locY = Math.floor(settings.worldHeight * Math.random() + 10)
        this.radius = settings.defaultSize
        this.color = this.getRandomColor()
        this.score = 0;
        this.orbsAbsorbed = 0;
    }

    getRandomColor() {
        const r = Math.floor((Math.random() * 200) + 50)
        const g = Math.floor((Math.random() * 200) + 50)
        const b = Math.floor((Math.random() * 200) + 50)

        return `rgb(${r},${g},${b})`
    }
}

module.exports = PlayerData
