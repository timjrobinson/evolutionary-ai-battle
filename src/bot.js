import { translateMatrix, rotateAroundPoint, degreesToRadians, sigmoid } from './math';
import Genome from './genome';

import {
    MAP_WIDTH,
    MAP_HEIGHT,
    BRAIN_CANVAS_SCALE,
    INPUT_WIDTH,
    NN_SQUARE_SIZE,
    MAX_NEURONS,
    INPUT_NEURONS,
    STARTING_LIVES,
} from './constants'

/* Codespace = {
    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer
} */

class Bot {
    constructor(id) {
        this.id = id;
        this.xPos = 350;
        this.yPos = 150;
        this.rotation = 0;
        this.bullets = [];
        this.lives = STARTING_LIVES;
        this.genome = new Genome();

        if (this.id > 1) {
            this.xPos = 750;
            this.rotation = 180;
        }

    }

    loadGenome(genome) {
        this.genome = genome;
    }

    createOutputObject() {
        // if (this.id == 2) return this.createRandomOutputObject();
        if (this.id == 2) return this.createStandAndShootOutputObject();
        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not
        const neurons = this.genome.neurons;
        const outputNeurons = neurons.slice(MAX_NEURONS, neurons.length);
        const outputValues = outputNeurons.map((neuron) => {
            return neuron.value > 0 ? 1 : 0;
        });
        return {
            // First bit is if it's negative, other 4 bits are 0 -> 15
            dx: (outputValues[0] * -1) * (outputValues[1] * 1 + outputValues[2] * 2 + outputValues[3] * 4 + outputValues[4] * 8), 
            dy: (outputValues[5] * -1) * (outputValues[6] * 1 + outputValues[7] * 2 + outputValues[8] * 4 + outputValues[9] * 8), 
            dh: (outputValues[10] * -1) * (outputValues[11] * 1 + outputValues[12] * 2 + outputValues[13] * 4 + outputValues[14] * 8), 
            ds: outputValues[15] 
        }
    }

    createRandomOutputObject() {
        return {
            dx: Math.floor(Math.random() * 30) - 15,
            dy: Math.floor(Math.random() * 30) - 15,
            dh: Math.floor(Math.random() * 30) - 15,
            ds: Math.random() < 0.1
        }
    }

    createStandAndShootOutputObject() {
        return {
            dx: 0,
            dy: 0,
            dh: 0,
            ds: Math.random() < 0.1
        }
    }

    updateNetwork(inputs) {
        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)
        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)
        this.setInputNeurons(translatedPositions);
        this.drawBrainView(translatedPositions);
    }

    updateBotPosition(xPos, yPos, rotation) {
        this.xPos = xPos
        this.yPos = yPos
        this.rotation = rotation
    }

    translateObjectPositions(otherPlayer) {
        const playerXPos = this.xPos;
        const playerYPos = this.yPos;
        const rotationAngle =  degreesToRadians(-this.rotation);
        const centerPointX = MAP_WIDTH / 2;
        const centerPointY = MAP_HEIGHT / 2;
        const translationMatrix = [MAP_WIDTH - this.xPos, MAP_HEIGHT - this.yPos];

        const otherPlayerRotated = rotateAroundPoint(this.xPos, this.yPos, rotationAngle, [otherPlayer.xPos, otherPlayer.yPos]);
        const otherPlayerTranslated = translateMatrix(translationMatrix, otherPlayerRotated);

        return {
            xPos: otherPlayerTranslated[0],
            yPos: otherPlayerTranslated[1],
            bullets: otherPlayer.bullets.map((bullet) => {
                const bulletRotated = rotateAroundPoint(playerXPos, playerYPos, rotationAngle, [bullet.xPos, bullet.yPos]);
                const bulletTranslated = translateMatrix(translationMatrix, bulletRotated);
                return {
                    xPos: bulletTranslated[0],
                    yPos: bulletTranslated[1]
                }
            })
        }
    }

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
        }
    }


    /* This gets the current inputs, and makes their input flow down the network
    to get to the outputs and figure out what output to press */
    calculateWeights() {
        this.genome.calculateWeights();
    }

    drawBrainView(translatedPositions) {
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
            const scaledXPos = this.scaleForBrain(MAP_WIDTH);
            const scaledYPos = this.scaleForBrain(MAP_HEIGHT);
            ctx.fillRect(scaledXPos, scaledYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);

            //Draw other player and objects, translated to how this brain sees them. 
            ctx.fillStyle = enemyColor;
            const opponentXPos = this.scaleForBrain(translatedPositions.xPos);
            const opponentYPos = this.scaleForBrain(translatedPositions.yPos);
            ctx.fillRect(opponentXPos, opponentYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);

            ctx.fillStyle = "#000000";
            translatedPositions.bullets.forEach((bullet) => {
                const bulletXPos = this.scaleForBrain(bullet.xPos);
                const bulletYPos = this.scaleForBrain(bullet.yPos);
                ctx.fillRect(bulletXPos, bulletYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);
            });

        }
    }

    // Scales a value to display correctly on the brain graph
    scaleForBrain(value) {
        // We find the square of the neural network (each are NN_SQUARE_SIZE in width and height)
        // Place the object in the one it's inside, and then scale based on the size of this brain canvas. 
        return Math.floor(value / NN_SQUARE_SIZE) * BRAIN_CANVAS_SCALE;
    }

    update(inputs) {
        this.updateNetwork(inputs);
        this.calculateWeights();
        return this.createOutputObject()
    }
}

export default Bot;
