import { translateMatrix, rotateAroundPoint, degreesToRadians, multiplyMatrixAndPoint } from './math';

const MAX_NEURONS = 10e5;
const MAP_WIDTH = 1000; 
const MAP_HEIGHT = 500; 

const BRAIN_CANVAS_WIDTH = 400;

const BOT_SIZE = 25;
const BULLET_SIZE = 10;

const NN_SQUARE_SIZE = 25;
const BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (MAP_WIDTH / NN_SQUARE_SIZE)); 

const CENTER_X_POS = MAP_WIDTH / 2;
const CENTER_Y_POS = MAP_HEIGHT / 2;

const INPUT_WIDTH = (MAP_WIDTH / NN_SQUARE_SIZE) * 2;
const INPUT_HEIGHT = (MAP_HEIGHT / NN_SQUARE_SIZE) * 2;
const INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;
const OUTPUT_NEURONS = 16;

const STARTING_LIVES = 5;

/* Codespace = {
    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer
} */

class Bot {
    constructor(id) {
        this.id = id;
        this.xPos = 450;
        this.yPos = 150;
        this.rotation = 90;
        this.bullets = [];
        this.lives = STARTING_LIVES;

        if (this.id > 1) {
            this.xPos = 650;
            this.rotation = 180;
        }
    }

    initializeGenome() {
        this.genes = [];
    }

    loadGenome(genome) {
        genome.genes.forEach(function (gene) {
            this.genes.append(Object.assign({}, gene));
        });

        initializeNeurons()
    }

    createNeuron() {
        return {
            sum: 0
        };
    }

    initializeNeurons() {
        this.neurons = [];

        for (let i = 0; i++; i < INPUT_NEURONS) {
            this.neurons.append(createNeuron())
        }

        for (let i = 0; i++; i < INPUT_NEURONS) {
            this.neurons[MAX_NEURONS+i] = createNeuron();
        }
    }

    createOutputObject() {

        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not
        return {
            dx: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object
            dy: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object
            dh: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object
            ds: Math.round(Math.random()),
        }

    }

    updateNetwork(inputs) {
        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)
        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)
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
        const translationMatrix = [centerPointX - this.xPos, centerPointY - this.yPos];

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
            const scaledXPos = this.scaleForBrain(CENTER_X_POS);
            const scaledYPos = this.scaleForBrain(CENTER_Y_POS);
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
        this.updateNetwork(inputs)
        return this.createOutputObject()
    }
}

export default Bot;
