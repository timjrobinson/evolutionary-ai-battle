
const BOT_SIZE = 25;
const MAX_SPEED = 15;

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const MAX_X_POS = MAP_WIDTH - BOT_SIZE;
const MAX_Y_POS = MAP_HEIGHT - BOT_SIZE;

class Battleground {
    constructor() {
        this.bots = [];
        this.bullets = [];
    }

    addBots(bot1, bot2) {
        this.bots.push(bot1)
        this.bots.push(bot2)
    }

    start() {
        console.log("Starting battleground");
        setInterval(this.update.bind(this), 75);
    }

    updateBot(bot, otherBot) {
        const gameState = {
            xPos: bot.xPos,
            yPos: bot.yPos,
            rotation: bot.rotation,
            otherPlayer: {
                xPos: otherBot.xPos,
                yPos: otherBot.yPos,
                rotation: otherBot.rotation
            }
        }
        const botActions = bot.update(gameState);

        const xMovement = Math.min(botActions.dx, MAX_SPEED);
        const yMovement = Math.min(botActions.dy, MAX_SPEED);
        const rotation = Math.min(botActions.dh, MAX_SPEED);

        bot.xPos = Math.min(Math.max(bot.xPos + xMovement, 0), MAX_X_POS);
        bot.yPos = Math.min(Math.max(bot.yPos + yMovement, 0), MAX_Y_POS);
        bot.rotation += rotation;

        // bot.bullets.forEach(function(bullet) {
            //bulletMove = TODO: Calculate where the bullet is going based on its xPos/yPos/rotation
        // });

        if (botActions.ds && bot.bullets.length < 5) {
            let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);
        }
    }

    spawnBullet(xPos, yPos, rotation) {

    }

    update() {
        this.updateBot(this.bots[0], this.bots[1]);
        this.updateBot(this.bots[1], this.bots[0]);
    }
}

module.exports = Battleground;