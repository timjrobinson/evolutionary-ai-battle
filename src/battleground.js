
import { distanceBetweenPoints } from './math';

const ORIGINAL_TICK_TIME = 75;
const TICK_TIME = 75;
const TICK_RATIO = ORIGINAL_TICK_TIME / TICK_TIME;

const BOT_SIZE = 25;
const MAX_SPEED = 15 * TICK_RATIO;

const BULLET_SIZE = 10;
const BULLET_SPEED = 150;

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const BOT_RADIUS = BOT_SIZE / 2;
const BULLET_RADIUS = BULLET_SIZE / 2;

const MIN_X_POS = 0 + BOT_RADIUS;
const MIN_Y_POS = 0 + BOT_RADIUS;
const MAX_X_POS = MAP_WIDTH - BOT_RADIUS;
const MAX_Y_POS = MAP_HEIGHT - BOT_RADIUS;

const NO_ACTION_TIMEOUT = 5;

class Battleground {
    constructor() {
        this.bots = [];
        this.botActions = [];
        this.bullets = [];
        this.onEnd = null;
        this.winner = null;
        this.lastActionTime = null;
    }

    addBots(bot1, bot2) {
        this.bots.push(bot1)
        this.bots.push(bot2)
    }

    start(onEnd) {
        console.log("Starting battleground");
        this.onEnd = onEnd;
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.lastActionTime = Date.now();
        this.updateBots();
        this.updateBotsInterval = setInterval(this.updateBots.bind(this), TICK_TIME);
        this.updateInterval = setInterval(this.update.bind(this), 10);
        this.drawInterval = setInterval(this.draw.bind(this), 10);
    }

    end() {
        if (!this.onEnd) return;

        clearInterval(this.updateBotsInterval);
        clearInterval(this.updateInterval);
        clearInterval(this.drawInterval);

        this.endTime = Date.now();
        const totalTime = (this.endTime - this.startTime) / 1000;
        const results = {
            startTime: this.startTime,
            endTime: this.endTime,
            totalTime,
            winner: this.winner
        };
        this.onEnd(results);
        this.onEnd = null;
    }

    updateBot(bot, otherBot) {
        const gameState = {
            xPos: bot.xPos,
            yPos: bot.yPos,
            rotation: bot.rotation,
            bullets: bot.bullets,
            otherPlayer: {
                xPos: otherBot.xPos,
                yPos: otherBot.yPos,
                rotation: otherBot.rotation,
                bullets: otherBot.bullets
            }
        }
        const botActions = bot.update(gameState);
        return botActions;
    }

    updateBots() {
        this.botActions[0] = this.updateBot(this.bots[0], this.bots[1]);
        this.botActions[1] = this.updateBot(this.bots[1], this.bots[0]);
        if (this.botDidActions(this.botActions[0]) || this.botDidActions(this.botActions[1])) {
            this.lastActionTime = Date.now()
        }
        if ((Date.now() - this.lastActionTime) / 1000 > NO_ACTION_TIMEOUT) {
            this.end();
        }
    }

    botDidActions(botActions) {
        return botActions.dx != 0 || botActions.dy != 0 || botActions.dh != 0 || botActions.ds != 0;
    }

    update() {
        const delta = (Date.now() - this.lastUpdate) / 1000;
        this.lastUpdate = Date.now();

        for (var i = 0; i < this.bots.length; i++) {
            const bot = this.bots[i];
            const botActions = this.botActions[i];
            const otherBot = i == 0 ? this.bots[1] : this.bots[0];

            const xMovement = Math.min(botActions.dx, MAX_SPEED) * delta;
            const yMovement = Math.min(botActions.dy, MAX_SPEED) * delta;
            const rotation = Math.min(botActions.dh, MAX_SPEED) * delta;

            bot.xPos = Math.min(Math.max(bot.xPos + xMovement, MIN_X_POS), MAX_X_POS);
            bot.yPos = Math.min(Math.max(bot.yPos + yMovement, MIN_Y_POS), MAX_Y_POS);
            bot.rotation += rotation;
            if (bot.rotation > 360)  {
                bot.rotation -= 360;
            }
            if (bot.rotation < 0) {
                bot.rotation += 360;
            }

            bot.bullets.forEach((bullet) => {
                const xDistance = BULLET_SPEED * Math.cos(bullet.rotation * Math.PI / 180) * delta
                const yDistance = BULLET_SPEED * Math.sin(bullet.rotation * Math.PI / 180) * delta
                bullet.xPos += xDistance;
                bullet.yPos += yDistance;
                if (bullet.xPos > MAX_X_POS || bullet.xPos < 0) {
                    bullet.dead = true
                }
                if (bullet.yPos > MAX_Y_POS || bullet.yPos < 0) {
                    bullet.dead = true
                }

                if (distanceBetweenPoints(bullet.xPos, bullet.yPos, otherBot.xPos, otherBot.yPos) < (BULLET_RADIUS + BOT_RADIUS)) {
                    otherBot.lives -= 1;
                    // console.log("Bot " + otherBot.id + " hit! Now has " + otherBot.lives + " lives left.");
                    if (otherBot.lives <= 0) {
                        this.winner = bot.id;
                        return this.end();
                    }
                    bullet.dead = true;
                }
            });

            bot.bullets = bot.bullets.filter(function (bullet) { return !bullet.dead; });
            // console.log("Bot bullets: ", bot.bullets);

            if (botActions.ds && bot.bullets.length < 5) {
                let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);
                // console.log("Spawning bullet: ", bullet);
                botActions.ds = false;
                bot.bullets.push(bullet);
            }
        }
    }

    draw() {
        var canvas = document.getElementById('battleground');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            let fillStyle = "#ddffdd";
            ctx.fillStyle = fillStyle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.bots.forEach(function (bot) {
                const botColor = bot.id == 1 ? "#ffdddd" : "#ddddff";
                ctx.fillStyle = botColor;
                ctx.beginPath();
                ctx.arc(bot.xPos, bot.yPos, BOT_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();

                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(bot.xPos, bot.yPos);
                ctx.lineTo(
                    bot.xPos + (BOT_RADIUS * Math.cos(bot.rotation * Math.PI / 180)),
                    bot.yPos + (BOT_RADIUS * Math.sin(bot.rotation * Math.PI / 180)),
                )
                ctx.stroke();
                ctx.resetTransform();

                ctx.fillStyle = "#000000";
                if (bot.bullets.length) {
                    bot.bullets.forEach(function (bullet) {
                        ctx.beginPath();
                        ctx.arc(bullet.xPos, bullet.yPos, BULLET_RADIUS, 0, 2 * Math.PI, false);
                        ctx.fill();
                    })
                }
            });
        }
    }

    spawnBullet(xPos, yPos, rotation) {
        return {
            xPos,
            yPos,
            rotation
        };
    }

}

export default Battleground;