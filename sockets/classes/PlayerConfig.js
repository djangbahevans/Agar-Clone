// This is where all the data that no other player needs to know
class PlayerConfig {
    constructor(settings) {
        this.xVector = 0;
        this.yVector = 0;
        this.speed = settings.defaultSpeed;
        this.zoom = settings.defaultZoom;
    }
}

module.exports = PlayerConfig