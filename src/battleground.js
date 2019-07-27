/**
 * The battleground class controls the updating and drawing of an invidual battle between bots. 
 * 
 * It runs an update loop that ticks every config.tickTime milliseconds, and runs a draw loop that runs
 * as fast as your computer can handle. 
 */
import { distanceBetweenPoints } from './math';
import config from '../config/default.json'

const TICK_TIME = config.tickTime;
const BOT_RADIUS = config.botSize / 2;
const BULLET_RADIUS = config.bulletSize / 2;

const MIN_X_POS = 0 + BOT_RADIUS;
const MIN_Y_POS = 0 + BOT_RADIUS;
const MAX_X_POS = config.mapWidth - BOT_RADIUS;
const MAX_Y_POS = config.mapHeight - BOT_RADIUS;
const MAX_SPEED = config.maxSpeed;
const BULLET_SPEED = config.bulletSpeed;

const NO_ACTION_TIMEOUT = config.noActionTimeout;
const NO_MOVE_TIMEOUT = config.noMoveTimeout;
const BATTLE_TIMEOUT = config.maxRoundTime;

class Battleground {
    constructor() {
        this.bots = [];
        this.botActions = [];
        this.bullets = [];
        this.onEnd = null;
        this.winner = null;
        this.lastActionTime = null;
        this.lastBotMoveTime = null;
        this.lastShootTime = [Date.now(), Date.now()];
    }

    /**
     * Add both bots to the battleground 
     * @param {Bot} bot1 
     * @param {Bot} bot2 
     */
    addBots(bot1, bot2) {
        this.bots.push(bot1)
        this.bots.push(bot2)
    }

    /**
     * Initializes all the variables for the battle and starts the battleground. 
     * Sets updateBots function to run every TICK_TIME, while the update and draw
     * functions run at 10ms to make the game look smooth. 
     * @param {Function} onEnd - callback to call after the battle has ended
     */
    start(onEnd) {
        console.log("Starting battleground");
        this.onEnd = onEnd;
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.lastActionTime = Date.now();
        this.lastBotMoveTime = Date.now();
        this.updateBots();
        this.updateBotsInterval = setInterval(this.updateBots.bind(this), TICK_TIME);
        this.updateInterval = setInterval(this.update.bind(this), 10);
        this.drawInterval = setInterval(this.draw.bind(this), 10);
    }

    /**
     * End the battle, clearing all the update timers, calculating results and reporting those 
     * results to the onEnd callback function.
     */
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
            winner: this.winner,
            bot1: {
                lives: this.bots[0].lives
            },
            bot2: {
                lives: this.bots[1].lives
            }
        };
        this.onEnd(results);
        this.onEnd = null;
    }

    /**
     * Calls the bot update function with the current game state, then retrieves the actions the bot
     * wants to take and returns them to the calling function.  
     * @param {Bot} bot 
     * @param {Bot} otherBot 
     */
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

    /** 
     * Main update loop for the two bots in the world. Gathers their actions which are then used
     * in the update loop. Also keeps track of the last time bot1 (the bot we are training) 
     * performed an action so that if it stops doing anything for a while the battlefield ends.  
     */
    updateBots() {
        this.botActions[0] = this.updateBot(this.bots[0], this.bots[1]);
        this.botActions[1] = this.updateBot(this.bots[1], this.bots[0]);
        if (this.botDidActions(this.botActions[0])) {
            this.lastActionTime = Date.now()
        }
        if ((Date.now() - this.lastActionTime) / 1000 > NO_ACTION_TIMEOUT) {
            this.end();
        }
        if ((Date.now() - this.lastBotMoveTime) / 1000 > NO_MOVE_TIMEOUT) {
            this.end();
        }
        if ((Date.now() - this.startTime) / 1000 > BATTLE_TIMEOUT) {
            this.end();
        }
    }

    /**
     * Takes a set of actions returned from the bot.update function and determines if the bot 
     * is actually taking any action. Returns true if the bot is doing anything, false if not.  
     * @param {Object} botActions 
     */
    botDidActions(botActions) {
        return botActions.dx != 0 || botActions.dy != 0 || botActions.dh != 0 || botActions.ds != 0;
    }

    /**
     * Compares the bots old position to it's new posittion. Returns true if the bot moved, false
     * if the bot did not move.  
     * @param {Bot} bot 
     * @param {int} newXPos 
     * @param {int} newYPos 
     */
    botMoved(bot, newXPos, newYPos) {
        return bot.xPos != newXPos || bot.yPos != newYPos;
    }

    /**
     * The main update loop of the battlefield. Takes the actions for each bot and makes the bots
     * move around and shoot based on them. Then calculates if any bullets collided, checks lives
     * lost, and ends the game if there is a final winner. 
     */
    update() {
        const delta = (Date.now() - this.lastUpdate) / 1000;
        const moveSpeedMultiplier = 1000 / TICK_TIME; // Bots actually move at maxSpeed every 75ms not every 1000ms.

        this.lastUpdate = Date.now();

        for (var i = 0; i < this.bots.length; i++) {
            const bot = this.bots[i];
            const botActions = this.botActions[i];
            const otherBot = i == 0 ? this.bots[1] : this.bots[0];

            const xMovement = Math.max(Math.min(botActions.dx, MAX_SPEED), -MAX_SPEED) * delta * moveSpeedMultiplier;
            const yMovement = Math.max(Math.min(botActions.dy, MAX_SPEED), -MAX_SPEED) * delta * moveSpeedMultiplier;
            const rotation = Math.max(Math.min(botActions.dh, MAX_SPEED), -MAX_SPEED) * delta * moveSpeedMultiplier;

            const newXPos = Math.min(Math.max(bot.xPos + xMovement, MIN_X_POS), MAX_X_POS);
            const newYPos = Math.min(Math.max(bot.yPos + yMovement, MIN_Y_POS), MAX_Y_POS);

            if (bot.id === 1 && this.botMoved(bot, newXPos, newYPos)) {
                this.lastBotMoveTime = Date.now();
            }

            bot.xPos = newXPos;
            bot.yPos = newYPos;
            bot.rotation += rotation;
            if (bot.rotation > 360)  {
                bot.rotation -= 360;
            }
            if (bot.rotation < 0) {
                bot.rotation += 360;
            }

            bot.bullets.forEach((bullet) => {
                const xDistance = BULLET_SPEED * Math.cos(bullet.rotation * Math.PI / 180) * delta * moveSpeedMultiplier;
                const yDistance = BULLET_SPEED * Math.sin(bullet.rotation * Math.PI / 180) * delta * moveSpeedMultiplier;
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

            if (botActions.ds && bot.bullets.length < 5 && (Date.now() - this.lastShootTime[i]) >= TICK_TIME) {
                this.lastShootTime[i] = Date.now();
                let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);
                // console.log("Spawning bullet: ", bullet);
                botActions.ds = false;
                bot.bullets.push(bullet);
            }
        }
    }

    /**
     * Draws the main battlefield to the screen. Does not run in NodeJS training mode
     */
    draw() {
        if (typeof document === "undefined") return;

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

    /** 
     * Returns a bullet object given a position and rotation
     */
    spawnBullet(xPos, yPos, rotation) {
        return {
            xPos,
            yPos,
            rotation
        };
    }

}

export default Battleground;