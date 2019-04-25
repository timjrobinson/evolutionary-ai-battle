'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _math = require('./math');

var _constants = require('./constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BOT_RADIUS = _constants.BOT_SIZE / 2;
var BULLET_RADIUS = _constants.BULLET_SIZE / 2;

var MIN_X_POS = 0 + BOT_RADIUS;
var MIN_Y_POS = 0 + BOT_RADIUS;
var MAX_X_POS = _constants.MAP_WIDTH - BOT_RADIUS;
var MAX_Y_POS = _constants.MAP_HEIGHT - BOT_RADIUS;

var NO_ACTION_TIMEOUT = 5;
var NO_MOVE_TIMEOUT = 15;
var BATTLE_TIMEOUT = 60;

var Battleground = function () {
    function Battleground() {
        _classCallCheck(this, Battleground);

        this.bots = [];
        this.botActions = [];
        this.bullets = [];
        this.onEnd = null;
        this.winner = null;
        this.lastActionTime = null;
        this.lastBotMoveTime = null;
        this.lastShootTime = [Date.now(), Date.now()];
    }

    _createClass(Battleground, [{
        key: 'addBots',
        value: function addBots(bot1, bot2) {
            this.bots.push(bot1);
            this.bots.push(bot2);
        }
    }, {
        key: 'start',
        value: function start(onEnd) {
            console.log("Starting battleground");
            this.onEnd = onEnd;
            this.startTime = Date.now();
            this.lastUpdate = Date.now();
            this.lastActionTime = Date.now();
            this.lastBotMoveTime = Date.now();
            this.updateBots();
            this.updateBotsInterval = setInterval(this.updateBots.bind(this), _constants.TICK_TIME);
            this.updateInterval = setInterval(this.update.bind(this), 10);
            this.drawInterval = setInterval(this.draw.bind(this), 10);
        }
    }, {
        key: 'end',
        value: function end() {
            if (!this.onEnd) return;

            clearInterval(this.updateBotsInterval);
            clearInterval(this.updateInterval);
            clearInterval(this.drawInterval);

            this.endTime = Date.now();
            var totalTime = (this.endTime - this.startTime) / 1000;
            var results = {
                startTime: this.startTime,
                endTime: this.endTime,
                totalTime: totalTime,
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
    }, {
        key: 'updateBot',
        value: function updateBot(bot, otherBot) {
            var gameState = {
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
            };
            var botActions = bot.update(gameState);
            return botActions;
        }
    }, {
        key: 'updateBots',
        value: function updateBots() {
            this.botActions[0] = this.updateBot(this.bots[0], this.bots[1]);
            this.botActions[1] = this.updateBot(this.bots[1], this.bots[0]);
            if (this.botDidActions(this.botActions[0])) {
                this.lastActionTime = Date.now();
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
    }, {
        key: 'botDidActions',
        value: function botDidActions(botActions) {
            return botActions.dx != 0 || botActions.dy != 0 || botActions.dh != 0 || botActions.ds != 0;
        }
    }, {
        key: 'botMoved',
        value: function botMoved(bot, newXPos, newYPos) {
            return bot.xPos != newXPos || bot.yPos != newYPos;
        }
    }, {
        key: 'update',
        value: function update() {
            var _this = this;

            var delta = (Date.now() - this.lastUpdate) / 1000;
            var moveSpeedMultiplier = 1000 / _constants.TICK_TIME; // Bots actually move at maxSpeed every 75ms not every 1000ms.

            this.lastUpdate = Date.now();

            var _loop = function _loop() {
                var bot = _this.bots[i];
                var botActions = _this.botActions[i];
                var otherBot = i == 0 ? _this.bots[1] : _this.bots[0];

                var xMovement = Math.max(Math.min(botActions.dx, _constants.MAX_SPEED), -_constants.MAX_SPEED) * delta * moveSpeedMultiplier;
                var yMovement = Math.max(Math.min(botActions.dy, _constants.MAX_SPEED), -_constants.MAX_SPEED) * delta * moveSpeedMultiplier;
                var rotation = Math.max(Math.min(botActions.dh, _constants.MAX_SPEED), -_constants.MAX_SPEED) * delta * moveSpeedMultiplier;

                var newXPos = Math.min(Math.max(bot.xPos + xMovement, MIN_X_POS), MAX_X_POS);
                var newYPos = Math.min(Math.max(bot.yPos + yMovement, MIN_Y_POS), MAX_Y_POS);

                if (bot.id === 1 && _this.botMoved(bot, newXPos, newYPos)) {
                    _this.lastBotMoveTime = Date.now();
                }

                bot.xPos = newXPos;
                bot.yPos = newYPos;
                bot.rotation += rotation;
                if (bot.rotation > 360) {
                    bot.rotation -= 360;
                }
                if (bot.rotation < 0) {
                    bot.rotation += 360;
                }

                bot.bullets.forEach(function (bullet) {
                    var xDistance = _constants.BULLET_SPEED * Math.cos(bullet.rotation * Math.PI / 180) * delta * moveSpeedMultiplier;
                    var yDistance = _constants.BULLET_SPEED * Math.sin(bullet.rotation * Math.PI / 180) * delta * moveSpeedMultiplier;
                    bullet.xPos += xDistance;
                    bullet.yPos += yDistance;
                    if (bullet.xPos > MAX_X_POS || bullet.xPos < 0) {
                        bullet.dead = true;
                    }
                    if (bullet.yPos > MAX_Y_POS || bullet.yPos < 0) {
                        bullet.dead = true;
                    }

                    if ((0, _math.distanceBetweenPoints)(bullet.xPos, bullet.yPos, otherBot.xPos, otherBot.yPos) < BULLET_RADIUS + BOT_RADIUS) {
                        otherBot.lives -= 1;
                        // console.log("Bot " + otherBot.id + " hit! Now has " + otherBot.lives + " lives left.");
                        if (otherBot.lives <= 0) {
                            _this.winner = bot.id;
                            return _this.end();
                        }
                        bullet.dead = true;
                    }
                });

                bot.bullets = bot.bullets.filter(function (bullet) {
                    return !bullet.dead;
                });
                // console.log("Bot bullets: ", bot.bullets);

                if (botActions.ds && bot.bullets.length < 5 && Date.now() - _this.lastShootTime[i] >= _constants.TICK_TIME) {
                    _this.lastShootTime[i] = Date.now();
                    var bullet = _this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);
                    // console.log("Spawning bullet: ", bullet);
                    botActions.ds = false;
                    bot.bullets.push(bullet);
                }
            };

            for (var i = 0; i < this.bots.length; i++) {
                _loop();
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (typeof document === "undefined") return;

            var canvas = document.getElementById('battleground');
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                var fillStyle = "#ddffdd";
                ctx.fillStyle = fillStyle;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                this.bots.forEach(function (bot) {
                    var botColor = bot.id == 1 ? "#ffdddd" : "#ddddff";
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
                    ctx.lineTo(bot.xPos + BOT_RADIUS * Math.cos(bot.rotation * Math.PI / 180), bot.yPos + BOT_RADIUS * Math.sin(bot.rotation * Math.PI / 180));
                    ctx.stroke();
                    ctx.resetTransform();

                    ctx.fillStyle = "#000000";
                    if (bot.bullets.length) {
                        bot.bullets.forEach(function (bullet) {
                            ctx.beginPath();
                            ctx.arc(bullet.xPos, bullet.yPos, BULLET_RADIUS, 0, 2 * Math.PI, false);
                            ctx.fill();
                        });
                    }
                });
            }
        }
    }, {
        key: 'spawnBullet',
        value: function spawnBullet(xPos, yPos, rotation) {
            return {
                xPos: xPos,
                yPos: yPos,
                rotation: rotation
            };
        }
    }]);

    return Battleground;
}();

exports.default = Battleground;