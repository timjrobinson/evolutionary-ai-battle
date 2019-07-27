/**
 * This class controls the bots actions. It takes in the world state from the battleground each tick, 
 * and responds with the actions the bot is going to take in that tick. 
 * 
 * It does this through the following steps:
 *  - Collect the bot and bullet positions from the battleground
 *  - Build a map of the world relative to the bots position and direction (see README for further details on why)
 *  - Turn that map of the world into the input layer of the neural network
 *  - Run the neural network, making neurons fire based on that input layer
 *  - Take the output layer of the neural network and make decisions based on that
 */

import { translateMatrix, rotateAroundPoint, degreesToRadians, sigmoid } from './math';
import Genome from './genome';
import config from '../config/default.json';
const debug = require("debug")("eai:bot");

import {
    BRAIN_CANVAS_SCALE,
    INPUT_WIDTH,
    INPUT_NEURONS,
} from './constants'

const MAP_WIDTH = config.mapWidth;
const MAP_HEIGHT = config.mapHeight;
const NN_SQUARE_SIZE = config.neuralNetworkSquareSize;
const MAX_SPEED = config.maxSpeed;
const STARTING_LIVES = config.startingLives;

class Bot {
    constructor(id) {
        this.id = id;
        this.xPos = config.botStartPoses[0].xPos;
        this.yPos = config.botStartPoses[0].yPos;
        this.rotation = config.botStartPoses[0].rotation;
        this.bullets = [];
        this.lives = STARTING_LIVES;
        this.genome = new Genome();
        this.outputMethod = null;

        if (this.id > 1) {
            this.xPos = config.botStartPoses[1].xPos;
            this.yPos = config.botStartPoses[1].yPos;
            this.rotation = config.botStartPoses[1].rotation;
        }

    }

    loadGenome(genome) {
        this.genome = genome;
    }
    
    /**
     * Chooses a random non-neural network based AI method for the bot. This is used for the second
     * bot in the battle so that the first bot can learn to beat these random AI's initially. If both
     * bots used a neural network they wouldn't do much in the beginning. 
     * 
     * As more and more generations are played there is a higher chance that the second bot will use
     * a neural network instead of one of these random algorithms. This is so that eventually it will
     * be a competition of the best neural networks and they learn and evolve against each other.  
     * 
     * @param {int} totalGenerations 
     */
    selectAIMethod(totalGenerations) {
        const chanceToChooseRealGenome = totalGenerations / 100;
        if (Math.random() < chanceToChooseRealGenome) {
            debug("Using real Genome for AI");
            return; // Will use real genome
        }
        const randomMethod = Math.floor(Math.random() * 4); 
        debug("AI Method chosen: " + randomMethod);

        switch (randomMethod) {
            case 0: return this.aiMethod = this.createRandomOutputObject.bind(this)
            case 1: return this.aiMethod = this.createStandAndShootOutputObject.bind(this);
            case 2: return this.aiMethod = this.createMoveVerticalAndShootOutputObject.bind(this);
            case 3: return this.aiMethod = this.createSpinAndShootOutputObject.bind(this);
        }
    }

    /** 
     * Creates and returns the output object describing the actions the bot is performing this tick.
     */
    createOutputObject() {
        /* If an aiMethod has been chosen, use that instead of a neural network */
        if (this.aiMethod) {
            return this.aiMethod();
        }
        const neurons = this.genome.neurons;

        /** 
         * The outputNeurons are at the very end of the neuron list. Each neuron corrosponds to one 
         * action that the bot will take if it's value is > 0
         *      0 = left
         *      1 = right
         *      2 = up
         *      3 = down
         *      4 = rotate left
         *      5 = rotate down
         *      6 = shoot
         */
        const outputNeurons = neurons.slice(config.maxNeurons, neurons.length);

        /**
         * For each outputNeuron if its value is > 0 then the outputValue is set to 1 and the action
         * is performed. 
         */
        const outputValues = outputNeurons.map((neuron) => {
            return neuron.value > 0 ? 1 : 0;
        });

        /**
         * Set the bots x and y speed based on the outputValues 0 - 3
         */
        const dx = outputValues[0] * -MAX_SPEED + outputValues[1] * MAX_SPEED;
        const dy = outputValues[2] * -MAX_SPEED + outputValues[3] * MAX_SPEED;

        /**
         * Set the bots rotation speed based on the outputValues 4 -5
         * First we need to translate what the bot thinks it wants to do into real world space, 
         * as the bots neural network is based on the direction it's facing, so when it says "I want 
         * to move right" while it's facing to the west it actually means it wants to move up in the 
         * real world.
         */
        const translatedDx = Math.cos(degreesToRadians(this.rotation)) * dx - Math.sin(degreesToRadians(this.rotation)) * dy;
        const translatedDy = Math.sin(degreesToRadians(this.rotation)) * dx + Math.cos(degreesToRadians(this.rotation)) * dy;
        const dh = outputValues[4] * -MAX_SPEED + outputValues[5] * MAX_SPEED

        return {
            dx: translatedDx, 
            dy: translatedDy, 
            dh, 
            ds: outputValues[6] 
        }
    }

    /** 
     * AI Method - RandomOutput
     * Returns some random movement and shoot variables
     */
    createRandomOutputObject() {
        return {
            dx: Math.floor(Math.random() * 30) - 15,
            dy: Math.floor(Math.random() * 30) - 15,
            dh: Math.floor(Math.random() * 30) - 15,
            ds: Math.random() < 0.1
        }
    }

    /**
     * AI Method - StandAndShoot
     * Bot does not move and shoots randomly in its starting orientation
     */
    createStandAndShootOutputObject() {
        return {
            dx: 0,
            dy: 0,
            dh: 0,
            ds: Math.random() < 0.1
        }
    }

    /**
     * AI Method - VerticleShoot 
     * The bot moves down the screen shooting randomly
     */
    createMoveVerticalAndShootOutputObject() {
        return {
            dx: 0,
            dy: 15 * Math.floor(Math.random() * 2) - 1,
            dh: 0,
            ds: Math.random() < 0.05
        }
    }

    /**
     * AI Method - Spin and Shoot 
     * The bot moves towards the opponent spinning and shooting constantly
     */
    createSpinAndShootOutputObject() {
        return {
            ds: true,
            dh: 5,
            dy: this.otherPlayer.yPos - this.yPos,
            dx: this.otherPlayer.xPos - this.xPos,
        }
    }

    /**
     * Sets the input layer of the neural network with the positions of players and bullets, after 
     * some translation has been done to make them relative to the bots position/orientation. 
     * 
     * @param {NNInputs} inputs 
     */
    updateNetwork(inputs) {
        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)
        this.otherPlayer = inputs.otherPlayer;
        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)
        this.setInputNeurons(translatedPositions);
        this.drawBrainView(translatedPositions);
    }

    /**
     * Updates this bots position and rotation. 
     * 
     * @param {int} xPos bots x-position
     * @param {int} yPos bots y-position
     * @param {int} rotation angle in degrees (0 - 360)
     */
    updateBotPosition(xPos, yPos, rotation) {
        this.xPos = xPos
        this.yPos = yPos
        this.rotation = rotation
    }

    /**
     * Takes the global positions of all players and bullets and turns then into local positions 
     * relative to the bots position and location, so the world rotates around the bot. 
     * 
     * @param {PlayerInfo} otherPlayer 
     */
    translateObjectPositions(otherPlayer) {
        const playerXPos = this.xPos;
        const playerYPos = this.yPos;
        const rotationAngle =  degreesToRadians(-this.rotation);
        const translationMatrix = [MAP_WIDTH - this.xPos, MAP_HEIGHT - this.yPos];

        const otherPlayerRotated = rotateAroundPoint(this.xPos, this.yPos, rotationAngle, [otherPlayer.xPos, otherPlayer.yPos]);
        const otherPlayerTranslated = translateMatrix(translationMatrix, otherPlayerRotated);
        const walls = [];
        for (var i = NN_SQUARE_SIZE / 2; i < MAP_WIDTH; i += NN_SQUARE_SIZE) {
            walls.push({xPos: i, yPos: -NN_SQUARE_SIZE / 2});
            walls.push({xPos: i, yPos: MAP_HEIGHT + (NN_SQUARE_SIZE / 2)});
        }
        for (var i = NN_SQUARE_SIZE / 2; i < MAP_HEIGHT; i += NN_SQUARE_SIZE) {
            walls.push({xPos: -NN_SQUARE_SIZE / 2, yPos: i});
            walls.push({xPos: MAP_WIDTH + (NN_SQUARE_SIZE / 2), yPos: i});
        }
         
        const verticalOffset = this.getVerticalOffset();
        return {
            xPos: otherPlayerTranslated[0],
            yPos: otherPlayerTranslated[1] + verticalOffset,
            bullets: otherPlayer.bullets.map((bullet) => {
                const bulletRotated = rotateAroundPoint(playerXPos, playerYPos, rotationAngle, [bullet.xPos, bullet.yPos]);
                const bulletTranslated = translateMatrix(translationMatrix, bulletRotated);
                return {
                    xPos: bulletTranslated[0],
                    yPos: bulletTranslated[1] + verticalOffset
                }
            }),
            walls: walls.map((wall) => {
                const wallRotated = rotateAroundPoint(playerXPos, playerYPos, rotationAngle, [wall.xPos, wall.yPos]);
                const wallTranslated = translateMatrix(translationMatrix, wallRotated);
                return {
                    xPos: wallTranslated[0],
                    yPos: wallTranslated[1] + verticalOffset
                }
            })
        }
    }

    /** 
     * Because the battlefield rotates in the bots brain, the brain must be a square whose width is 
     * the longest axis of the battlefield. If the brain was not square when the bot turns 90 degrees
     * the entire battlefield wouldn't fit in its brain. 
     * 
     * So this function gets the amount that we need to vertically move the translated positions so 
     * that after translation all positions are positive (nothing has fallen off the top of the screen)
     */
    getVerticalOffset() {
        return MAP_WIDTH - MAP_HEIGHT;
    }

    /**
     * The neural network input layer is a array of size (mapWidth * mapHeight) / nnSquareSize
     * each neuron corrosponds to a grid tile from left to right, top to bottom, where each grid tile
     * is nnSquareSize pixels wide. So when `nnSquareSize = 50` neuron 1 is the tile at `0,0`, 
     * neuron 2 is the tile at `50,0`, neuron 3 is `100,0` etc. 
     * 
     * Each nueron is set to the value 1 if the opponent is on the tile, or -1 if a bullet or wall is 
     * there (where walls mark the edge of the battlefield). If there is nothing on that tile the 
     * value is 0. 
     * 
     * @param {BattleInfo} translatedPositions - The translated positions of all world objects
     */
    setInputNeurons(translatedPositions) {
        const neurons = this.genome.neurons;
        for (let i = 0; i < INPUT_NEURONS; i++) {
            neurons[i].value = 0;
            let currentSquare = {
                minX: Math.floor(i % INPUT_WIDTH) * NN_SQUARE_SIZE,
                maxX: (Math.floor(i % INPUT_WIDTH) + 1) * NN_SQUARE_SIZE,
                minY: Math.floor(i / INPUT_WIDTH) * NN_SQUARE_SIZE,
                maxY: (Math.floor(i / INPUT_WIDTH) + 1) * NN_SQUARE_SIZE,
            }
            if (translatedPositions.xPos > currentSquare.minX && translatedPositions.xPos < currentSquare.maxX
                && translatedPositions.yPos > currentSquare.minY && translatedPositions.yPos < currentSquare.maxY) {
                neurons[i].value = 1;
            }
            translatedPositions.bullets.forEach((bullet) => {
                if (bullet.xPos > currentSquare.minX && bullet.xPos < currentSquare.maxX
                    && bullet.yPos > currentSquare.minY && bullet.yPos < currentSquare.maxY) {
                    neurons[i].value = -1;
                }
            });
            translatedPositions.walls.forEach((wall) => {
                if (wall.xPos > currentSquare.minX && wall.xPos < currentSquare.maxX
                    && wall.yPos > currentSquare.minY && wall.yPos < currentSquare.maxY) {
                    neurons[i].value = -1;
                }
            });
        }
    }

    /**
     * Gets the current inputs, and runs the network, makes their input flow down the network
     * to get to the output neurons.
     **/
    calculateWeights() {
        this.genome.calculateWeights();
    }

    /** 
     * Draws a canvas view of what the world looks to the bot. Everything has been moved and rotated
     * so that it is relative to the bots position and orientation.
     **/
    drawBrainView(translatedPositions) {
        if (typeof document === "undefined") return;

        var canvas = document.getElementById('bot' + this.id + 'brain');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            const playerBGColor = this.id == 1 ? "#ffdddd" : "#ddddff";
            const playerColor = this.id == 1 ? "#ff0000" : "#0000ff";
            const enemyColor = this.id == 1 ? "#0000ff" : "#ff0000";
            ctx.fillStyle = playerBGColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw player, always in center. 
            ctx.fillStyle = playerColor;
            const scaledXPos = this.scaleForBrainView(MAP_WIDTH);
            const scaledYPos = this.scaleForBrainView(MAP_HEIGHT + this.getVerticalOffset());
            ctx.fillRect(scaledXPos, scaledYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);

            //Draw other player and objects, translated to how this brain sees them. 
            ctx.fillStyle = enemyColor;
            const opponentXPos = this.scaleForBrainView(translatedPositions.xPos);
            const opponentYPos = this.scaleForBrainView(translatedPositions.yPos);
            ctx.fillRect(opponentXPos, opponentYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);

            ctx.fillStyle = "#000000";
            translatedPositions.bullets.forEach((bullet) => {
                const bulletXPos = this.scaleForBrainView(bullet.xPos);
                const bulletYPos = this.scaleForBrainView(bullet.yPos);
                ctx.fillRect(bulletXPos, bulletYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);
            });

            translatedPositions.walls.forEach((wall) => {
                const wallXPos = this.scaleForBrainView(wall.xPos);
                const wallYPos = this.scaleForBrainView(wall.yPos);
                ctx.fillRect(wallXPos, wallYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);
            });


        }
    }

    /**
     * Scales position values to fit the world onto the small brain view graph. 
     * 
     * @param {int} value 
     */
    scaleForBrainView(value) {
        /**
         * Find the square of the neural network (each are NN_SQUARE_SIZE in width and height) that 
         * the value is inside, and then scale based on the size of this brain canvas. 
         */
        return Math.floor(value / NN_SQUARE_SIZE) * BRAIN_CANVAS_SCALE;
    }
 
    /**
     * This is called by the BattleGround each tick. Takes the current world information 
     * and returns the bots action for this tick. 
     * 
     * @param {BattleInfo} inputs 
     */
    update(inputs) {
        this.updateNetwork(inputs);
        this.calculateWeights();
        return this.createOutputObject()
    }
}

export default Bot;
