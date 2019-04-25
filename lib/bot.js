'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _math = require('./math');

var _genome = require('./genome');

var _genome2 = _interopRequireDefault(_genome);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Codespace = {
    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer
} */

var Bot = function () {
    function Bot(id) {
        _classCallCheck(this, Bot);

        this.id = id;
        this.xPos = _constants.PLAYER1_START_X;
        this.yPos = _constants.PLAYER1_START_Y;
        this.rotation = 0;
        this.bullets = [];
        this.lives = _constants.STARTING_LIVES;
        this.genome = new _genome2.default();
        this.outputMethod = null;

        if (this.id > 1) {
            this.xPos = _constants.PLAYER2_START_X;
            this.yPos = _constants.PLAYER2_START_Y;
            this.rotation = _constants.PLAYER2_START_ROTATION;
        }
    }

    _createClass(Bot, [{
        key: 'loadGenome',
        value: function loadGenome(genome) {
            this.genome = genome;
        }
    }, {
        key: 'selectAIMethod',
        value: function selectAIMethod() {
            var randomMethod = Math.floor(Math.random() * 5); // 5th method is to use the gnome assigned like player1
            console.log("AI Method chosen: " + randomMethod);

            switch (randomMethod) {
                case 0:
                    return this.aiMethod = this.createRandomOutputObject.bind(this);
                case 1:
                    return this.aiMethod = this.createStandAndShootOutputObject.bind(this);
                case 2:
                    return this.aiMethod = this.createMoveVerticalAndShootOutputObject.bind(this);
                case 3:
                    return this.aiMethod = this.createSpinAndShootOutputObject.bind(this);
            }
        }
    }, {
        key: 'createOutputObject',
        value: function createOutputObject() {
            if (this.id == 2 && this.aiMethod) {
                return this.aiMethod();
            }
            // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not
            var neurons = this.genome.neurons;
            var outputNeurons = neurons.slice(_constants.MAX_NEURONS, neurons.length);
            var outputValues = outputNeurons.map(function (neuron) {
                return neuron.value > 0 ? 1 : 0;
            });

            // First bit is if it's negative, other 4 bits are 0 -> 15
            // let dx = outputValues[0] == 0 ? -1 : 1; 
            // dx *= (outputValues[1] * 1 + outputValues[2] * 2 + outputValues[3] * 4 + outputValues[4] * 8);
            // let dy = outputValues[5] == 0 ? -1 : 1;
            // dy *= (outputValues[6] * 1 + outputValues[7] * 2 + outputValues[8] * 4 + outputValues[9] * 8);
            // let dh = outputValues[10] == 0 ? -1 : 1;
            // dh *=  (outputValues[11] * 1 + outputValues[12] * 2 + outputValues[13] * 4 + outputValues[14] * 8);

            var dx = outputValues[0] * -_constants.MAX_SPEED + outputValues[1] * _constants.MAX_SPEED;
            var dy = outputValues[2] * -_constants.MAX_SPEED + outputValues[3] * _constants.MAX_SPEED;

            // Translate what the bot thinks it wants to do into real world space (as the bots vision is based on its direction)
            var translatedDx = Math.cos((0, _math.degreesToRadians)(this.rotation)) * dx - Math.sin((0, _math.degreesToRadians)(this.rotation)) * dy;
            var translatedDy = Math.sin((0, _math.degreesToRadians)(this.rotation)) * dx + Math.cos((0, _math.degreesToRadians)(this.rotation)) * dy;

            var dh = outputValues[4] * -_constants.MAX_SPEED + outputValues[5] * _constants.MAX_SPEED;

            return {
                dx: translatedDx,
                dy: translatedDy,
                dh: dh,
                ds: outputValues[6]
            };
        }
    }, {
        key: 'createRandomOutputObject',
        value: function createRandomOutputObject() {
            return {
                dx: Math.floor(Math.random() * 30) - 15,
                dy: Math.floor(Math.random() * 30) - 15,
                dh: Math.floor(Math.random() * 30) - 15,
                ds: Math.random() < 0.1
            };
        }
    }, {
        key: 'createStandAndShootOutputObject',
        value: function createStandAndShootOutputObject() {
            return {
                dx: 0,
                dy: 0,
                dh: 0,
                ds: Math.random() < 0.1
            };
        }
    }, {
        key: 'createMoveVerticalAndShootOutputObject',
        value: function createMoveVerticalAndShootOutputObject() {
            return {
                dx: 0,
                dy: 15 * Math.floor(Math.random() * 2) - 1,
                dh: 0,
                ds: Math.random() < 0.05
            };
        }
    }, {
        key: 'createSpinAndShootOutputObject',
        value: function createSpinAndShootOutputObject() {
            return {
                ds: true,
                dh: 5,
                dy: this.otherPlayer.yPos - this.yPos,
                dx: this.otherPlayer.xPos - this.xPos
            };
        }
    }, {
        key: 'updateNetwork',
        value: function updateNetwork(inputs) {
            this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation);
            this.otherPlayer = inputs.otherPlayer;
            var translatedPositions = this.translateObjectPositions(inputs.otherPlayer);
            this.setInputNeurons(translatedPositions);
            this.drawBrainView(translatedPositions);
        }
    }, {
        key: 'updateBotPosition',
        value: function updateBotPosition(xPos, yPos, rotation) {
            this.xPos = xPos;
            this.yPos = yPos;
            this.rotation = rotation;
        }
    }, {
        key: 'translateObjectPositions',
        value: function translateObjectPositions(otherPlayer) {
            var playerXPos = this.xPos;
            var playerYPos = this.yPos;
            var rotationAngle = (0, _math.degreesToRadians)(-this.rotation);
            var centerPointX = _constants.MAP_WIDTH / 2;
            var centerPointY = _constants.MAP_HEIGHT / 2;
            var translationMatrix = [_constants.MAP_WIDTH - this.xPos, _constants.MAP_HEIGHT - this.yPos];

            var otherPlayerRotated = (0, _math.rotateAroundPoint)(this.xPos, this.yPos, rotationAngle, [otherPlayer.xPos, otherPlayer.yPos]);
            var otherPlayerTranslated = (0, _math.translateMatrix)(translationMatrix, otherPlayerRotated);
            var walls = [];
            for (var i = _constants.NN_SQUARE_SIZE / 2; i < _constants.MAP_WIDTH; i += _constants.NN_SQUARE_SIZE) {
                walls.push({ xPos: i, yPos: -_constants.NN_SQUARE_SIZE / 2 });
                walls.push({ xPos: i, yPos: _constants.MAP_HEIGHT + _constants.NN_SQUARE_SIZE / 2 });
            }
            for (var i = _constants.NN_SQUARE_SIZE / 2; i < _constants.MAP_HEIGHT; i += _constants.NN_SQUARE_SIZE) {
                walls.push({ xPos: -_constants.NN_SQUARE_SIZE / 2, yPos: i });
                walls.push({ xPos: _constants.MAP_WIDTH + _constants.NN_SQUARE_SIZE / 2, yPos: i });
            }

            return {
                xPos: otherPlayerTranslated[0],
                yPos: otherPlayerTranslated[1],
                bullets: otherPlayer.bullets.map(function (bullet) {
                    var bulletRotated = (0, _math.rotateAroundPoint)(playerXPos, playerYPos, rotationAngle, [bullet.xPos, bullet.yPos]);
                    var bulletTranslated = (0, _math.translateMatrix)(translationMatrix, bulletRotated);
                    return {
                        xPos: bulletTranslated[0],
                        yPos: bulletTranslated[1]
                    };
                }),
                walls: walls.map(function (wall) {
                    var wallRotated = (0, _math.rotateAroundPoint)(playerXPos, playerYPos, rotationAngle, [wall.xPos, wall.yPos]);
                    var wallTranslated = (0, _math.translateMatrix)(translationMatrix, wallRotated);
                    return {
                        xPos: wallTranslated[0],
                        yPos: wallTranslated[1]
                    };
                })
            };
        }
    }, {
        key: 'setInputNeurons',
        value: function setInputNeurons(translatedPositions) {
            var neurons = this.genome.neurons;

            var _loop = function _loop(i) {
                neurons[i].value = 0;
                var currentSquare = {
                    minX: Math.floor(i % _constants.INPUT_WIDTH) * _constants.NN_SQUARE_SIZE,
                    maxX: (Math.floor(i % _constants.INPUT_WIDTH) + 1) * _constants.NN_SQUARE_SIZE,
                    minY: Math.floor(i / _constants.INPUT_WIDTH) * _constants.NN_SQUARE_SIZE,
                    maxY: (Math.floor(i / _constants.INPUT_WIDTH) + 1) * _constants.NN_SQUARE_SIZE
                };
                if (translatedPositions.xPos > currentSquare.minX && translatedPositions.xPos < currentSquare.maxX && translatedPositions.yPos > currentSquare.minY && translatedPositions.yPos < currentSquare.maxY) {
                    neurons[i].value = 1;
                }
                translatedPositions.bullets.forEach(function (bullet) {
                    if (bullet.xPos > currentSquare.minX && bullet.xPos < currentSquare.maxX && bullet.yPos > currentSquare.minY && bullet.yPos < currentSquare.maxY) {
                        neurons[i].value = -1;
                    }
                });
                translatedPositions.walls.forEach(function (wall) {
                    if (wall.xPos > currentSquare.minX && wall.xPos < currentSquare.maxX && wall.yPos > currentSquare.minY && wall.yPos < currentSquare.maxY) {
                        neurons[i].value = -1;
                    }
                });
            };

            for (var i = 0; i < _constants.INPUT_NEURONS; i++) {
                _loop(i);
            }
        }

        /* This gets the current inputs, and makes their input flow down the network
        to get to the outputs and figure out what output to press */

    }, {
        key: 'calculateWeights',
        value: function calculateWeights() {
            this.genome.calculateWeights();
        }
    }, {
        key: 'drawBrainView',
        value: function drawBrainView(translatedPositions) {
            var _this = this;

            if (typeof document === "undefined") return;

            var canvas = document.getElementById('bot' + this.id + 'brain');
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                var playerBGColor = this.id == 1 ? "#ffdddd" : "#ddddff";
                var playerColor = this.id == 1 ? "#ff0000" : "#0000ff";
                var enemyColor = this.id == 1 ? "#0000ff" : "#ff0000";
                ctx.fillStyle = playerBGColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw player, always in center. 
                ctx.fillStyle = playerColor;
                var scaledXPos = this.scaleForBrain(_constants.MAP_WIDTH);
                var scaledYPos = this.scaleForBrain(_constants.MAP_HEIGHT);
                ctx.fillRect(scaledXPos, scaledYPos, _constants.BRAIN_CANVAS_SCALE, _constants.BRAIN_CANVAS_SCALE);

                //Draw other player and objects, translated to how this brain sees them. 
                ctx.fillStyle = enemyColor;
                var opponentXPos = this.scaleForBrain(translatedPositions.xPos);
                var opponentYPos = this.scaleForBrain(translatedPositions.yPos);
                ctx.fillRect(opponentXPos, opponentYPos, _constants.BRAIN_CANVAS_SCALE, _constants.BRAIN_CANVAS_SCALE);

                ctx.fillStyle = "#000000";
                translatedPositions.bullets.forEach(function (bullet) {
                    var bulletXPos = _this.scaleForBrain(bullet.xPos);
                    var bulletYPos = _this.scaleForBrain(bullet.yPos);
                    ctx.fillRect(bulletXPos, bulletYPos, _constants.BRAIN_CANVAS_SCALE, _constants.BRAIN_CANVAS_SCALE);
                });

                translatedPositions.walls.forEach(function (wall) {
                    var wallXPos = _this.scaleForBrain(wall.xPos);
                    var wallYPos = _this.scaleForBrain(wall.yPos);
                    ctx.fillRect(wallXPos, wallYPos, _constants.BRAIN_CANVAS_SCALE, _constants.BRAIN_CANVAS_SCALE);
                });
            }
        }

        // Scales a value to display correctly on the brain graph

    }, {
        key: 'scaleForBrain',
        value: function scaleForBrain(value) {
            // We find the square of the neural network (each are NN_SQUARE_SIZE in width and height)
            // Place the object in the one it's inside, and then scale based on the size of this brain canvas. 
            return Math.floor(value / _constants.NN_SQUARE_SIZE) * _constants.BRAIN_CANVAS_SCALE;
        }
    }, {
        key: 'update',
        value: function update(inputs) {
            this.updateNetwork(inputs);
            this.calculateWeights();
            return this.createOutputObject();
        }
    }]);

    return Bot;
}();

exports.default = Bot;