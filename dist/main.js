/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/battleground.js":
/*!*****************************!*\
  !*** ./src/battleground.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./math */ \"./src/math.js\");\n\n\n\nconst ORIGINAL_TICK_TIME = 75;\nconst TICK_TIME = 75;\nconst TICK_RATIO = ORIGINAL_TICK_TIME / TICK_TIME;\n\nconst BOT_SIZE = 25;\nconst MAX_SPEED = 15 * TICK_RATIO;\n\nconst BULLET_SIZE = 10;\nconst BULLET_SPEED = 150;\n\nconst MAP_WIDTH = 1000;\nconst MAP_HEIGHT = 500;\n\nconst BOT_RADIUS = BOT_SIZE / 2;\nconst BULLET_RADIUS = BULLET_SIZE / 2;\n\nconst MIN_X_POS = 0 + BOT_RADIUS;\nconst MIN_Y_POS = 0 + BOT_RADIUS;\nconst MAX_X_POS = MAP_WIDTH - BOT_RADIUS;\nconst MAX_Y_POS = MAP_HEIGHT - BOT_RADIUS;\n\nclass Battleground {\n    constructor() {\n        this.bots = [];\n        this.botActions = [];\n        this.bullets = [];\n    }\n\n    addBots(bot1, bot2) {\n        this.bots.push(bot1)\n        this.bots.push(bot2)\n    }\n\n    start() {\n        console.log(\"Starting battleground\");\n        this.lastUpdate = Date.now();\n        setInterval(this.updateBots.bind(this), TICK_TIME);\n        setInterval(this.update.bind(this), 10);\n        setInterval(this.draw.bind(this), 10);\n    }\n\n    updateBot(bot, otherBot) {\n        const gameState = {\n            xPos: bot.xPos,\n            yPos: bot.yPos,\n            rotation: bot.rotation,\n            bullets: bot.bullets,\n            otherPlayer: {\n                xPos: otherBot.xPos,\n                yPos: otherBot.yPos,\n                rotation: otherBot.rotation,\n                bullets: otherBot.bullets\n            }\n        }\n        const botActions = bot.update(gameState);\n        return botActions;\n    }\n\n    updateBots() {\n        this.botActions[0] = this.updateBot(this.bots[0], this.bots[1]);\n        this.botActions[1] = this.updateBot(this.bots[1], this.bots[0]);\n    }\n\n    update() {\n        const delta = (Date.now() - this.lastUpdate) / 1000;\n        this.lastUpdate = Date.now();\n        const emptyBotActions = {dx: 0, dy: 0, dh: 0, ds: false}\n\n        for (var i = 0; i < this.bots.length; i++) {\n            const bot = this.bots[i];\n            const botActions = this.botActions[i] || emptyBotActions;\n            const otherBot = i == 0 ? this.bots[1] : this.bots[0];\n\n            const xMovement = Math.min(botActions.dx, MAX_SPEED) * delta;\n            const yMovement = Math.min(botActions.dy, MAX_SPEED) * delta;\n            const rotation = Math.min(botActions.dh, MAX_SPEED) * delta;\n\n            bot.xPos = Math.min(Math.max(bot.xPos + xMovement, MIN_X_POS), MAX_X_POS);\n            bot.yPos = Math.min(Math.max(bot.yPos + yMovement, MIN_Y_POS), MAX_Y_POS);\n            bot.rotation += rotation;\n            if (bot.rotation > 360)  {\n                bot.rotation -= 360;\n            }\n            if (bot.rotation < 0) {\n                bot.rotation += 360;\n            }\n\n            bot.bullets.forEach(function(bullet) {\n                const xDistance = BULLET_SPEED * Math.cos(bullet.rotation * Math.PI / 180) * delta\n                const yDistance = BULLET_SPEED * Math.sin(bullet.rotation * Math.PI / 180) * delta\n                bullet.xPos += xDistance;\n                bullet.yPos += yDistance;\n                if (bullet.xPos > MAX_X_POS || bullet.xPos < 0) {\n                    bullet.dead = true\n                }\n                if (bullet.yPos > MAX_Y_POS || bullet.yPos < 0) {\n                    bullet.dead = true\n                }\n\n                if (Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"distanceBetweenPoints\"])(bullet.xPos, bullet.yPos, otherBot.xPos, otherBot.yPos) < (BULLET_RADIUS + BOT_RADIUS)) {\n                    otherBot.lives -= 1;\n                    console.log(\"Bot \" + otherBot.id + \" hit! Now has \" + otherBot.lives + \" lives left.\");\n                    bullet.dead = true;\n                }\n            });\n\n            bot.bullets = bot.bullets.filter(function (bullet) { return !bullet.dead; });\n            // console.log(\"Bot bullets: \", bot.bullets);\n\n            if (botActions.ds && bot.bullets.length < 5) {\n                let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);\n                // console.log(\"Spawning bullet: \", bullet);\n                botActions.ds = false;\n                bot.bullets.push(bullet);\n            }\n        }\n    }\n\n    draw() {\n        var canvas = document.getElementById('battleground');\n        if (canvas.getContext) {\n            var ctx = canvas.getContext('2d');\n            let fillStyle = \"#ddffdd\";\n            ctx.fillStyle = fillStyle;\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n            this.bots.forEach(function (bot) {\n                const botColor = bot.id == 1 ? \"#ffdddd\" : \"#ddddff\";\n                ctx.fillStyle = botColor;\n                ctx.beginPath();\n                ctx.arc(bot.xPos, bot.yPos, BOT_RADIUS, 0, 2 * Math.PI, false);\n                ctx.fill();\n\n                ctx.strokeStyle = \"#000000\";\n                ctx.lineWidth = 1;\n                ctx.stroke();\n\n                ctx.beginPath();\n                ctx.lineWidth = 3;\n                ctx.moveTo(bot.xPos, bot.yPos);\n                ctx.lineTo(\n                    bot.xPos + (BOT_RADIUS * Math.cos(bot.rotation * Math.PI / 180)),\n                    bot.yPos + (BOT_RADIUS * Math.sin(bot.rotation * Math.PI / 180)),\n                )\n                ctx.stroke();\n                ctx.resetTransform();\n\n                ctx.fillStyle = \"#000000\";\n                if (bot.bullets.length) {\n                    bot.bullets.forEach(function (bullet) {\n                        ctx.beginPath();\n                        ctx.arc(bullet.xPos, bullet.yPos, BULLET_RADIUS, 0, 2 * Math.PI, false);\n                        ctx.fill();\n                    })\n                }\n            });\n        }\n    }\n\n    spawnBullet(xPos, yPos, rotation) {\n        return {\n            xPos,\n            yPos,\n            rotation\n        };\n    }\n\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Battleground);\n\n//# sourceURL=webpack:///./src/battleground.js?");

/***/ }),

/***/ "./src/bot.js":
/*!********************!*\
  !*** ./src/bot.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./math */ \"./src/math.js\");\n/* harmony import */ var _genome__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./genome */ \"./src/genome.js\");\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ \"./src/constants.js\");\n\n\n\n\n\n/* Codespace = {\n    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer\n} */\n\nclass Bot {\n    constructor(id) {\n        this.id = id;\n        this.xPos = 450;\n        this.yPos = 150;\n        this.rotation = 90;\n        this.bullets = [];\n        this.lives = _constants__WEBPACK_IMPORTED_MODULE_2__[\"STARTING_LIVES\"];\n        this.genome = new _genome__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n\n        if (this.id > 1) {\n            this.xPos = 650;\n            this.rotation = 180;\n        }\n\n    }\n\n    loadGenome(genome) {\n        this.genome.load(genome);\n    }\n\n    createOutputObject() {\n        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not\n        const neurons = this.genome.neurons;\n        const outputNeurons = neurons.slice(_constants__WEBPACK_IMPORTED_MODULE_2__[\"MAX_NEURONS\"], neurons.length);\n        const outputValues = outputNeurons.map((neuron) => {\n            return neuron.value > 0 ? 1 : 0;\n        });\n        return {\n            // First bit is if it's negative, other 4 bits are 0 -> 15\n            dx: (outputValues[0] * -1) * (outputValues[1] * 1 + outputValues[2] * 2 + outputValues[3] * 4 + outputValues[4] * 8), \n            dy: (outputValues[5] * -1) * (outputValues[6] * 1 + outputValues[7] * 2 + outputValues[8] * 4 + outputValues[9] * 8), \n            dh: (outputValues[10] * -1) * (outputValues[11] * 1 + outputValues[12] * 2 + outputValues[13] * 4 + outputValues[14] * 8), \n            ds: outputValues[15] \n        }\n    }\n\n    updateNetwork(inputs) {\n        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)\n        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)\n        this.setInputNeurons(translatedPositions);\n        this.drawBrainView(translatedPositions);\n    }\n\n    updateBotPosition(xPos, yPos, rotation) {\n        this.xPos = xPos\n        this.yPos = yPos\n        this.rotation = rotation\n    }\n\n    translateObjectPositions(otherPlayer) {\n        const playerXPos = this.xPos;\n        const playerYPos = this.yPos;\n        const rotationAngle =  Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"degreesToRadians\"])(-this.rotation);\n        const centerPointX = _constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_WIDTH\"] / 2;\n        const centerPointY = _constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_HEIGHT\"] / 2;\n        const translationMatrix = [_constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_WIDTH\"] - this.xPos, _constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_HEIGHT\"] - this.yPos];\n\n        const otherPlayerRotated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"rotateAroundPoint\"])(this.xPos, this.yPos, rotationAngle, [otherPlayer.xPos, otherPlayer.yPos]);\n        const otherPlayerTranslated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"translateMatrix\"])(translationMatrix, otherPlayerRotated);\n\n        return {\n            xPos: otherPlayerTranslated[0],\n            yPos: otherPlayerTranslated[1],\n            bullets: otherPlayer.bullets.map((bullet) => {\n                const bulletRotated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"rotateAroundPoint\"])(playerXPos, playerYPos, rotationAngle, [bullet.xPos, bullet.yPos]);\n                const bulletTranslated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"translateMatrix\"])(translationMatrix, bulletRotated);\n                return {\n                    xPos: bulletTranslated[0],\n                    yPos: bulletTranslated[1]\n                }\n            })\n        }\n    }\n\n    setInputNeurons(translatedPositions) {\n        const neurons = this.genome.neurons;\n        for (let i = 0; i < _constants__WEBPACK_IMPORTED_MODULE_2__[\"INPUT_NEURONS\"]; i++) {\n            neurons[i].value = 0;\n            let currentSquare = {\n                minX: Math.floor(i % _constants__WEBPACK_IMPORTED_MODULE_2__[\"INPUT_WIDTH\"]) * _constants__WEBPACK_IMPORTED_MODULE_2__[\"NN_SQUARE_SIZE\"],\n                maxX: (Math.floor(i % _constants__WEBPACK_IMPORTED_MODULE_2__[\"INPUT_WIDTH\"]) + 1) * _constants__WEBPACK_IMPORTED_MODULE_2__[\"NN_SQUARE_SIZE\"],\n                minY: Math.floor(i / _constants__WEBPACK_IMPORTED_MODULE_2__[\"INPUT_WIDTH\"]) * _constants__WEBPACK_IMPORTED_MODULE_2__[\"NN_SQUARE_SIZE\"],\n                maxY: (Math.floor(i / _constants__WEBPACK_IMPORTED_MODULE_2__[\"INPUT_WIDTH\"]) + 1) * _constants__WEBPACK_IMPORTED_MODULE_2__[\"NN_SQUARE_SIZE\"],\n            }\n            if (translatedPositions.xPos > currentSquare.minX && translatedPositions.xPos < currentSquare.maxX\n                && translatedPositions.yPos > currentSquare.minY && translatedPositions.yPos < currentSquare.maxY) {\n                neurons[i].value = 1;\n            }\n            translatedPositions.bullets.forEach((bullet) => {\n                if (bullet.xPos > currentSquare.minX && bullet.xPos < currentSquare.maxX\n                    && bullet.yPos > currentSquare.minY && bullet.yPos < currentSquare.maxY) {\n                    neurons[i].value = -1;\n                }\n            });\n        }\n    }\n\n\n    /* This gets the current inputs, and makes their input flow down the network\n    to get to the outputs and figure out what output to press */\n    calculateWeights() {\n        this.genome.calculateWeights();\n    }\n\n    drawBrainView(translatedPositions) {\n        var canvas = document.getElementById('bot' + this.id + 'brain');\n        if (canvas.getContext) {\n            var ctx = canvas.getContext('2d');\n            const playerBGColor = this.id == 1 ? \"#ffdddd\" : \"#ddddff\";\n            const playerColor = this.id == 1 ? \"#ff0000\" : \"#0000ff\";\n            const enemyColor = this.id == 1 ? \"#0000ff\" : \"#ff0000\";\n            ctx.fillStyle = playerBGColor;\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n            // Draw player, always in center. \n            ctx.fillStyle = playerColor;\n            const scaledXPos = this.scaleForBrain(_constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_WIDTH\"]);\n            const scaledYPos = this.scaleForBrain(_constants__WEBPACK_IMPORTED_MODULE_2__[\"MAP_HEIGHT\"]);\n            ctx.fillRect(scaledXPos, scaledYPos, _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"], _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"]);\n\n            //Draw other player and objects, translated to how this brain sees them. \n            ctx.fillStyle = enemyColor;\n            const opponentXPos = this.scaleForBrain(translatedPositions.xPos);\n            const opponentYPos = this.scaleForBrain(translatedPositions.yPos);\n            ctx.fillRect(opponentXPos, opponentYPos, _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"], _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"]);\n\n            ctx.fillStyle = \"#000000\";\n            translatedPositions.bullets.forEach((bullet) => {\n                const bulletXPos = this.scaleForBrain(bullet.xPos);\n                const bulletYPos = this.scaleForBrain(bullet.yPos);\n                ctx.fillRect(bulletXPos, bulletYPos, _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"], _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"]);\n            });\n\n        }\n    }\n\n    // Scales a value to display correctly on the brain graph\n    scaleForBrain(value) {\n        // We find the square of the neural network (each are NN_SQUARE_SIZE in width and height)\n        // Place the object in the one it's inside, and then scale based on the size of this brain canvas. \n        return Math.floor(value / _constants__WEBPACK_IMPORTED_MODULE_2__[\"NN_SQUARE_SIZE\"]) * _constants__WEBPACK_IMPORTED_MODULE_2__[\"BRAIN_CANVAS_SCALE\"];\n    }\n\n    update(inputs) {\n        this.updateNetwork(inputs);\n        this.calculateWeights();\n        return this.createOutputObject()\n    }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Bot);\n\n\n//# sourceURL=webpack:///./src/bot.js?");

/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! exports provided: MAX_NEURONS, MAP_WIDTH, MAP_HEIGHT, BRAIN_WIDTH, BRAIN_HEIGHT, BRAIN_CANVAS_WIDTH, NN_SQUARE_SIZE, BRAIN_CANVAS_SCALE, INPUT_WIDTH, INPUT_HEIGHT, INPUT_NEURONS, OUTPUT_NEURONS, STARTING_LIVES */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MAX_NEURONS\", function() { return MAX_NEURONS; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MAP_WIDTH\", function() { return MAP_WIDTH; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MAP_HEIGHT\", function() { return MAP_HEIGHT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BRAIN_WIDTH\", function() { return BRAIN_WIDTH; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BRAIN_HEIGHT\", function() { return BRAIN_HEIGHT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BRAIN_CANVAS_WIDTH\", function() { return BRAIN_CANVAS_WIDTH; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"NN_SQUARE_SIZE\", function() { return NN_SQUARE_SIZE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BRAIN_CANVAS_SCALE\", function() { return BRAIN_CANVAS_SCALE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_WIDTH\", function() { return INPUT_WIDTH; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_HEIGHT\", function() { return INPUT_HEIGHT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_NEURONS\", function() { return INPUT_NEURONS; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"OUTPUT_NEURONS\", function() { return OUTPUT_NEURONS; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"STARTING_LIVES\", function() { return STARTING_LIVES; });\nconst MAX_NEURONS = 10e4;\nconst MAP_WIDTH = 1000; \nconst MAP_HEIGHT = 500; \n\n// The brain is 2x the size of the map because the player is centered in the brain \n// so if player is in top left and other in bottom right it needs enough room to show them\nconst BRAIN_WIDTH = MAP_WIDTH * 2; \nconst BRAIN_HEIGHT = MAP_HEIGHT * 2;\n\nconst BRAIN_CANVAS_WIDTH = 400;\n\nconst NN_SQUARE_SIZE = 25;\nconst BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (BRAIN_WIDTH / NN_SQUARE_SIZE)); \n\nconst INPUT_WIDTH = BRAIN_WIDTH / NN_SQUARE_SIZE;\nconst INPUT_HEIGHT = BRAIN_HEIGHT / NN_SQUARE_SIZE;\nconst INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;\n\nconst OUTPUT_NEURONS = 16;\n\nconst STARTING_LIVES = 5;\n\n//# sourceURL=webpack:///./src/constants.js?");

/***/ }),

/***/ "./src/genome.js":
/*!***********************!*\
  !*** ./src/genome.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Genome; });\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ \"./src/constants.js\");\n/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./math */ \"./src/math.js\");\n\n\n\n\n\nconst INITIAL_MUTATION_RATE = 1;\n\nconst PARENT2_INNOVATION_GENE_CHANCE = 50;\nconst MUTATION_TYPES = ['connections', 'link', 'bias', 'node', 'enable', 'disable'];\n\nconst MUTATE_CONNECTION_CHANCE = 0.25;\nconst MUTATE_LINK_CHANCE = 2;\nconst MUTATE_NODE_CHANCE = 0.5;\nconst MUTATE_BIAS_CHANCE = 0.4;\nconst MUTATE_DISABLE_CHANCE = 0.4;\nconst MUTATE_ENABLE_CHANCE = 0.2;\nconst STEP_SIZE = 0.1;\n\nclass Gene {\n    constructor() {\n        this.into = null;\n        this.out = null;\n        this.weight = 0;\n        this.enabled = true;\n        this.innovation = 0;\n    }\n\n    clone() {\n        const gene = new Gene();\n        gene.into = this.into; \n        gene.out = this.out;\n        gene.weight = this.weight;\n        gene.enabled = this.enabled;\n        gene.innovation = this.innovation;\n        return gene;\n    }\n}\n\nclass Neuron {\n    constructor(id) {\n        this.id = id;\n        this.incoming = [];\n        this.outgoing = [];\n        this.value = 0;\n    }\n}\n\nclass Genome {\n    constructor() {\n        this.genes = [];\n        this.neurons = [];\n        this.maxNeuron = 0;\n        this.mutationRates = {\n            connections: MUTATE_CONNECTION_CHANCE,\n            link: MUTATE_LINK_CHANCE,\n            bias: MUTATE_BIAS_CHANCE,\n            node: MUTATE_NODE_CHANCE,\n            enable: MUTATE_ENABLE_CHANCE,\n            disable: MUTATE_DISABLE_CHANCE,\n            step: STEP_SIZE\n        };\n        this.fitness = 0;\n        this.globalRank = 0;\n        this.initializeNeurons();\n    }\n\n    load(genome) {\n        this.genes = [];\n        this.mutationRates = genome.getMutationRates()\n\n        genome.genes.forEach((gene) => {\n            this.genes.push(gene.clone());\n        });\n        this.initializeNeurons();\n    }\n\n    clone() {\n        const clonedGenome = new Genome();\n        this.genes.forEach(function (gene) {\n            clonedGenome.genes.push(gene.clone());\n        });\n\n        clonedGenome.mutationRates = this.getMutationRates();\n\n        return clonedGenome;\n    }\n\n    getMutationRates() {\n        return Object.assign({}, this.mutationRates);\n    }\n\n    initializeNeurons() {\n        this.neurons = [];\n\n        for (let i = 0; i < _constants__WEBPACK_IMPORTED_MODULE_0__[\"INPUT_NEURONS\"]; i++) {\n            this.neurons.push(this.createNeuron(i))\n        }\n\n        for (let i = 0; i < _constants__WEBPACK_IMPORTED_MODULE_0__[\"OUTPUT_NEURONS\"]; i++) {\n            let id = _constants__WEBPACK_IMPORTED_MODULE_0__[\"MAX_NEURONS\"] + i;\n            this.neurons[id] = this.createNeuron(id);\n        }\n\n        this.genes.forEach((gene) => {\n            if (!gene.enabled) return;\n\n            if (this.neurons[gene.out] == null) {\n                this.neurons[gene.out] = new Neuron(gene.out);\n            }\n            this.neurons[gene.out].incoming.push(gene);\n\n            if (this.neurons[gene.into] == null) {\n                this.neurons[gene.into] = new Neuron(gene.into);\n            }\n        });\n    }\n\n    createNeuron(id) {\n        const neuron = new Neuron(id);\n        return neuron;\n    }\n\n    /* Child gets most of its genes from parent1 which is the fittest \n    of the two parents */\n    inheritFromParents(parent1, parent2) {\n        const parent2Innovations = {};\n        for (let i = 0; i < parent2.genes.length; i++) {\n            let gene = parent2.genes[i];\n            parent2Innovations[gene.innovation] = gene;\n        }\n\n        for (let i = 0; i < parent1.genes.length; i++) {\n            let geneParent = parent1;\n            if (parent2Innovations[parent1.genes[i].innovation] != null\n                && Math.floor(Math.random() * 100) < PARENT2_INNOVATION_GENE_CHANCE\n                && parent2.genes[i].enabled) {\n                geneParent = parent2;\n            }\n\n            let gene = geneParent.genes[i].clone(); \n            this.genes.push(gene);\n        }\n        \n        this.maxNeuron = Math.max(parent1.maxNeuron, parent2.maxNeuron);\n        this.mutationRates = parent1.getMutationRates();\n    }\n\n    /* Chance of applying a random mutation to the child based on\n    its mutation rate */\n    mutate() {\n        const mutationType = MUTATION_TYPES[Math.floor(Math.random() * MUTATION_TYPES.length)];\n        const mutationFunctions = {\n            link: this.linkMutate,\n            node: this.nodeMutate,\n            enable: this.enableMutate,\n            disable: this.disableMutate\n        }\n\n        mutationFunctions[mutationType]();\n    }\n\n    getRandomNeuron(nonInput) {\n        let startingId = nonInput ? _constants__WEBPACK_IMPORTED_MODULE_0__[\"INPUT_NEURONS\"] : 0\n    }\n\n    linkMutate() {\n        const neuron1 = this.getRandomNeuron(false)\n        const neuron2 = this.getRandomNeuron(true)\n\n        const gene = new Gene()\n\n    }\n\n    nodeMutate() {\n\n    }\n\n    enableMutate() {\n\n    }\n\n    disableMutate() {\n\n    }\n\n    calculateWeights() {\n        for (let i = 0; i < this.neurons.length; i++) {\n            let neuron = this.neurons[i];\n            if (!neuron) continue;\n            let sum = 0;\n            for (let j = 0; j < neuron.incoming.length; j++) {\n                let incoming = neuron.incoming[j];\n                let other = this.neurons[incoming.into];\n                sum += incoming.weight * other.value;  \n            }\n            neuron.value = Object(_math__WEBPACK_IMPORTED_MODULE_1__[\"sigmoid\"])(sum);\n        }\n    }\n}\n\n//# sourceURL=webpack:///./src/genome.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _bot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bot */ \"./src/bot.js\");\n/* harmony import */ var _battleground__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./battleground */ \"./src/battleground.js\");\n// The main file that will import the battleground and bot and play bots against each other\n\n\n\n\nconst bot1 = new _bot__WEBPACK_IMPORTED_MODULE_0__[\"default\"](1);\nconst bot2 = new _bot__WEBPACK_IMPORTED_MODULE_0__[\"default\"](2);\n\nconst inputs = {\n    xPos: 5,\n    yPos: 5,\n    rotation: 0,\n    otherPlayer: {\n        xPos: 50,\n        yPos: 5,\n        rotation: 0\n    }\n}\n\n// const commands = bot.update(inputs);\n\nconst battleground = new _battleground__WEBPACK_IMPORTED_MODULE_1__[\"default\"]()\nbattleground.addBots(bot1, bot2);\nbattleground.start();\n\n// const codespace = Object.assign({}, commands);\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/math.js":
/*!*********************!*\
  !*** ./src/math.js ***!
  \*********************/
/*! exports provided: distanceBetweenPoints, translateMatrix, rotateMatrix, rotateAroundPoint, degreesToRadians, multiplyMatrixAndPoint, sigmoid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"distanceBetweenPoints\", function() { return distanceBetweenPoints; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"translateMatrix\", function() { return translateMatrix; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"rotateMatrix\", function() { return rotateMatrix; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"rotateAroundPoint\", function() { return rotateAroundPoint; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"degreesToRadians\", function() { return degreesToRadians; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"multiplyMatrixAndPoint\", function() { return multiplyMatrixAndPoint; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"sigmoid\", function() { return sigmoid; });\n\n\nfunction distanceBetweenPoints(x1, y1, x2, y2) {\n    var a = x1 - x2;\n    var b = y1 - y2;\n    return Math.sqrt(a*a + b*b);\n}\n\nfunction translateMatrix(matrix, point) {\n    const resultX = matrix[0] + point[0];\n    const resultY = matrix[1] + point[1];\n\n    return [resultX, resultY];\n}\n\nfunction rotateMatrix(matrix, point) {\n    const resultX = matrix[0][0] * point[0] + matrix[0][1] * point[1];\n    const resultY = matrix[1][0] * point[0] + matrix[1][1] * point[1];\n\n    return [resultX, resultY];\n}\n\nfunction rotateAroundPoint(pivotX, pivotY, angle, point) {\n    const s = Math.sin(angle);\n    const c = Math.cos(angle);\n\n    point[0] -= pivotX;\n    point[1] -= pivotY;\n\n    const rotatedX = point[0] * c - point[1] * s;\n    const rotatedY = point[0] * s + point[1] * c;\n\n    const resultX = rotatedX + pivotX;\n    const resultY = rotatedY + pivotY;\n\n    return [resultX, resultY];\n}\n\nfunction degreesToRadians(degrees) {\n    return degrees * Math.PI / 180\n}\n\nfunction multiplyMatrixAndPoint(matrix, point) {\n\n    var x = point[0];\n    var y = point[1];\n    var w = 1;\n    \n    var resultX = (x * matrix[0][0]) + (y * matrix[0][1]) + (w * matrix[0][2]);\n    var resultY = (x * matrix[1][0]) + (y * matrix[1][1]) + (w * matrix[1][2]);\n    \n    return [resultX, resultY];\n}\n\nfunction sigmoid(value) {\n    // return 1 / (1 + Math.pow(Math.E, -value));\n\n    return 2 / (1 + Math.exp(-4.9 * value)) - 1;\n}\n\n//# sourceURL=webpack:///./src/math.js?");

/***/ })

/******/ });