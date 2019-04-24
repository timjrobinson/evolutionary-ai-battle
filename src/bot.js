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
    PLAYER1_START_X,
    PLAYER1_START_Y,
    PLAYER1_START_ROTATION,
    PLAYER2_START_X,
    PLAYER2_START_Y,
    PLAYER2_START_ROTATION,
    MAX_SPEED
} from './constants'

/* Codespace = {
    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer
} */

class Bot {
    constructor(id) {
        this.id = id;
        this.xPos = PLAYER1_START_X;
        this.yPos = PLAYER1_START_Y;
        this.rotation = 0;
        this.bullets = [];
        this.lives = STARTING_LIVES;
        this.genome = new Genome();
        this.outputMethod = null;

        if (this.id > 1) {
            this.xPos = PLAYER2_START_X;
            this.yPos = PLAYER2_START_Y;
            this.rotation = PLAYER2_START_ROTATION;
        }

    }

    loadGenome(genome) {
        this.genome = genome;
    }
    
    selectAIMethod() {
        const randomMethod = Math.floor(Math.random() * 5); // 5th method is to use the gnome assigned like player1
        console.log("AI Method chosen: " + randomMethod);

        switch (randomMethod) {
            case 0: return this.aiMethod = this.createRandomOutputObject.bind(this)
            case 1: return this.aiMethod = this.createStandAndShootOutputObject.bind(this);
            case 2: return this.aiMethod = this.createMoveVerticalAndShootOutputObject.bind(this);
            case 3: return this.aiMethod = this.createSpinAndShootOutputObject.bind(this);
        }
    }

    createOutputObject() {
        if (this.id == 2 && this.aiMethod) {
            return this.aiMethod();
        }
        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not
        const neurons = this.genome.neurons;
        const outputNeurons = neurons.slice(MAX_NEURONS, neurons.length);
        const outputValues = outputNeurons.map((neuron) => {
            return neuron.value > 0 ? 1 : 0;
        });

        // First bit is if it's negative, other 4 bits are 0 -> 15
        // let dx = outputValues[0] == 0 ? -1 : 1; 
        // dx *= (outputValues[1] * 1 + outputValues[2] * 2 + outputValues[3] * 4 + outputValues[4] * 8);
        // let dy = outputValues[5] == 0 ? -1 : 1;
        // dy *= (outputValues[6] * 1 + outputValues[7] * 2 + outputValues[8] * 4 + outputValues[9] * 8);
        // let dh = outputValues[10] == 0 ? -1 : 1;
        // dh *=  (outputValues[11] * 1 + outputValues[12] * 2 + outputValues[13] * 4 + outputValues[14] * 8);

        let dx = outputValues[0] == 0 ? -1 : 1;
        dx *= (outputValues[1] * MAX_SPEED)
        let dy = outputValues[2] == 0 ? -1 : 1;
        dy *= (outputValues[3] * MAX_SPEED)

        // Translate what the bot thinks it wants to do into real world space (as the bots vision is based on its direction)
        const translatedDx = Math.cos(degreesToRadians(this.rotation)) * dx - Math.sin(degreesToRadians(this.rotation)) * dy;
        const translatedDy = Math.sin(degreesToRadians(this.rotation)) * dx + Math.cos(degreesToRadians(this.rotation)) * dy;

        let dh = outputValues[4] == 0 ? -1 : 1;
        dh *= (outputValues[5] * MAX_SPEED)

        return {
            dx: translatedDx, 
            dy: translatedDy, 
            dh, 
            ds: outputValues[6] 
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

    createMoveVerticalAndShootOutputObject() {
        return {
            dx: 0,
            dy: 15 * Math.floor(Math.random() * 2) - 1,
            dh: 0,
            ds: Math.random() < 0.05
        }
    }

    createSpinAndShootOutputObject() {
        return {
            ds: true,
            dh: 5,
            dy: this.otherPlayer.yPos - this.yPos,
            dx: this.otherPlayer.xPos - this.xPos,
        }
    }


    updateNetwork(inputs) {
        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)
        this.otherPlayer = inputs.otherPlayer;
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
        const walls = [];
        for (var i = NN_SQUARE_SIZE / 2; i < MAP_WIDTH; i += NN_SQUARE_SIZE) {
            walls.push({xPos: i, yPos: -NN_SQUARE_SIZE / 2});
            walls.push({xPos: i, yPos: MAP_HEIGHT + (NN_SQUARE_SIZE / 2)});
        }
        for (var i = NN_SQUARE_SIZE / 2; i < MAP_HEIGHT; i += NN_SQUARE_SIZE) {
            walls.push({xPos: -NN_SQUARE_SIZE / 2, yPos: i});
            walls.push({xPos: MAP_WIDTH + (NN_SQUARE_SIZE / 2), yPos: i});
        }
         

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
            }),
            walls: walls.map((wall) => {
                const wallRotated = rotateAroundPoint(playerXPos, playerYPos, rotationAngle, [wall.xPos, wall.yPos]);
                const wallTranslated = translateMatrix(translationMatrix, wallRotated);
                return {
                    xPos: wallTranslated[0],
                    yPos: wallTranslated[1]
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
            translatedPositions.walls.forEach((wall) => {
                if (wall.xPos > currentSquare.minX && wall.xPos < currentSquare.maxX
                    && wall.yPos > currentSquare.minY && wall.yPos < currentSquare.maxY) {
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

            translatedPositions.walls.forEach((wall) => {
                const wallXPos = this.scaleForBrain(wall.xPos);
                const wallYPos = this.scaleForBrain(wall.yPos);
                ctx.fillRect(wallXPos, wallYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);
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
