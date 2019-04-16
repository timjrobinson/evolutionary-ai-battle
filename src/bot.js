
const MAX_NEURONS = 10e5;
const MAP_WIDTH = 1000; 
const MAP_HEIGHT = 500; 
const NN_SQUARE_SIZE = 50;
const BRAIN_SCALE = 20;

const INPUT_WIDTH = (MAP_WIDTH / NN_SQUARE_SIZE) * 2;
const INPUT_HEIGHT = (MAP_HEIGHT / NN_SQUARE_SIZE) * 2;
const INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;
const OUTPUT_NEURONS = 16;

/* Codespace = {
    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer
} */

class Bot {
    constructor(id) {
        this.id = id;
        this.xPos = 50;
        this.yPos = 250;
        this.rotation = 0;
        this.bullets = [];

        if (this.id > 1) {
            this.xPos = 950;
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
            dx: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object
            dy: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object
            dh: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object
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
        const rotationMatrix = []; // Create based on the players rotation, we want to rotate the world around this point 
        const transposeMatrix = []; // Create based on players position, we want to ensure this bot is always the center of the world. 
        return {
            xPos: otherPlayer.xPos,
            yPos: otherPlayer.yPos,
            rotation: otherPlayer.rotation,
            bullets: otherPlayer.bullets
        }
    }

    drawBrainView() {
        var canvas = document.getElementById('bot' + this.id + 'brain');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            let fillStyle = "#ffdddd";
            if (this.id == 2) {
                fillStyle = "#ddddff"
            }
            ctx.fillStyle = fillStyle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#000000";
            const translatedXPos = Math.round(this.xPos / NN_SQUARE_SIZE * BRAIN_SCALE);
            const translatedYPos = Math.round(this.yPos / NN_SQUARE_SIZE * BRAIN_SCALE);
            ctx.fillRect(translatedXPos, translatedYPos, BRAIN_SCALE, BRAIN_SCALE);
        }
    }

    update(inputs) {
        this.updateNetwork(inputs)
        return this.createOutputObject()
    }
}

module.exports = Bot;
