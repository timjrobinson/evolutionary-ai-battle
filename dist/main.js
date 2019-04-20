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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./math */ \"./src/math.js\");\n\n\n\nconst ORIGINAL_TICK_TIME = 75;\nconst TICK_TIME = 500;\nconst TICK_RATIO = ORIGINAL_TICK_TIME / TICK_TIME;\n\nconst BOT_SIZE = 25;\nconst MAX_SPEED = 15 * TICK_RATIO;\n\nconst BULLET_SIZE = 10;\nconst BULLET_SPEED = 150;\n\nconst MAP_WIDTH = 1000;\nconst MAP_HEIGHT = 500;\n\nconst BOT_RADIUS = BOT_SIZE / 2;\nconst BULLET_RADIUS = BULLET_SIZE / 2;\n\nconst MIN_X_POS = 0 + BOT_RADIUS;\nconst MIN_Y_POS = 0 + BOT_RADIUS;\nconst MAX_X_POS = MAP_WIDTH - BOT_RADIUS;\nconst MAX_Y_POS = MAP_HEIGHT - BOT_RADIUS;\n\nclass Battleground {\n    constructor() {\n        this.bots = [];\n        this.botActions = [];\n        this.bullets = [];\n    }\n\n    addBots(bot1, bot2) {\n        this.bots.push(bot1)\n        this.bots.push(bot2)\n    }\n\n    start() {\n        console.log(\"Starting battleground\");\n        setInterval(this.updateBots.bind(this), TICK_TIME);\n        setInterval(this.update.bind(this), 10);\n        setInterval(this.draw.bind(this), 10);\n    }\n\n    updateBot(bot, otherBot) {\n        const gameState = {\n            xPos: bot.xPos,\n            yPos: bot.yPos,\n            rotation: bot.rotation,\n            bullets: bot.bullets,\n            otherPlayer: {\n                xPos: otherBot.xPos,\n                yPos: otherBot.yPos,\n                rotation: otherBot.rotation,\n                bullets: otherBot.bullets\n            }\n        }\n        const botActions = bot.update(gameState);\n        return botActions;\n    }\n\n    updateBots() {\n        this.botActions[0] = this.updateBot(this.bots[0], this.bots[1]);\n        this.botActions[1] = this.updateBot(this.bots[1], this.bots[0]);\n    }\n\n    update() {\n        const delta = (Date.now() - this.lastUpdate) / 1000;\n        this.lastUpdate = Date.now();\n\n        for (var i = 0; i < this.bots.length; i++) {\n            const bot = this.bots[i];\n            const botActions = this.botActions[i];\n            const otherBot = i == 0 ? this.bots[1] : this.bots[0];\n\n            const xMovement = Math.min(botActions.dx, MAX_SPEED) * delta;\n            const yMovement = Math.min(botActions.dy, MAX_SPEED) * delta;\n            const rotation = Math.min(botActions.dh, MAX_SPEED) * delta;\n\n            bot.xPos = Math.min(Math.max(bot.xPos + xMovement, MIN_X_POS), MAX_X_POS);\n            bot.yPos = Math.min(Math.max(bot.yPos + yMovement, MIN_Y_POS), MAX_Y_POS);\n            bot.rotation += rotation;\n            if (bot.rotation > 360)  {\n                bot.rotation -= 360;\n            }\n            if (bot.rotation < 0) {\n                bot.rotation += 360;\n            }\n\n            bot.bullets.forEach(function(bullet) {\n                const xDistance = BULLET_SPEED * Math.cos(bullet.rotation * Math.PI / 180) * delta\n                const yDistance = BULLET_SPEED * Math.sin(bullet.rotation * Math.PI / 180) * delta\n                bullet.xPos += xDistance;\n                bullet.yPos += yDistance;\n                if (bullet.xPos > MAX_X_POS || bullet.xPos < 0) {\n                    bullet.dead = true\n                }\n                if (bullet.yPos > MAX_Y_POS || bullet.yPos < 0) {\n                    bullet.dead = true\n                }\n\n                if (Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"distanceBetweenPoints\"])(bullet.xPos, bullet.yPos, otherBot.xPos, otherBot.yPos) < (BULLET_RADIUS + BOT_RADIUS)) {\n                    otherBot.lives -= 1;\n                    console.log(\"Bot \" + otherBot.id + \" hit! Now has \" + otherBot.lives + \" lives left.\");\n                    bullet.dead = true;\n                }\n            });\n\n            bot.bullets = bot.bullets.filter(function (bullet) { return !bullet.dead; });\n            // console.log(\"Bot bullets: \", bot.bullets);\n\n            if (botActions.ds && bot.bullets.length < 5) {\n                let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);\n                // console.log(\"Spawning bullet: \", bullet);\n                botActions.ds = false;\n                bot.bullets.push(bullet);\n            }\n        }\n    }\n\n    draw() {\n        var canvas = document.getElementById('battleground');\n        if (canvas.getContext) {\n            var ctx = canvas.getContext('2d');\n            let fillStyle = \"#ddffdd\";\n            ctx.fillStyle = fillStyle;\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n            this.bots.forEach(function (bot) {\n                const botColor = bot.id == 1 ? \"#ffdddd\" : \"#ddddff\";\n                ctx.fillStyle = botColor;\n                ctx.beginPath();\n                ctx.arc(bot.xPos, bot.yPos, BOT_RADIUS, 0, 2 * Math.PI, false);\n                ctx.fill();\n\n                ctx.strokeStyle = \"#000000\";\n                ctx.lineWidth = 1;\n                ctx.stroke();\n\n                ctx.beginPath();\n                ctx.lineWidth = 3;\n                ctx.moveTo(bot.xPos, bot.yPos);\n                ctx.lineTo(\n                    bot.xPos + (BOT_RADIUS * Math.cos(bot.rotation * Math.PI / 180)),\n                    bot.yPos + (BOT_RADIUS * Math.sin(bot.rotation * Math.PI / 180)),\n                )\n                ctx.stroke();\n                ctx.resetTransform();\n\n                ctx.fillStyle = \"#000000\";\n                if (bot.bullets.length) {\n                    bot.bullets.forEach(function (bullet) {\n                        ctx.beginPath();\n                        ctx.arc(bullet.xPos, bullet.yPos, BULLET_RADIUS, 0, 2 * Math.PI, false);\n                        ctx.fill();\n                    })\n                }\n            });\n        }\n    }\n\n    spawnBullet(xPos, yPos, rotation) {\n        return {\n            xPos,\n            yPos,\n            rotation\n        };\n    }\n\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Battleground);\n\n//# sourceURL=webpack:///./src/battleground.js?");

/***/ }),

/***/ "./src/bot.js":
/*!********************!*\
  !*** ./src/bot.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./math */ \"./src/math.js\");\n\n\nconst MAX_NEURONS = 10e5;\nconst MAP_WIDTH = 1000; \nconst MAP_HEIGHT = 500; \n\nconst BRAIN_CANVAS_WIDTH = 400;\n\nconst BOT_SIZE = 25;\nconst BULLET_SIZE = 10;\n\nconst NN_SQUARE_SIZE = 25;\nconst BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (MAP_WIDTH / NN_SQUARE_SIZE)); \n\nconst CENTER_X_POS = MAP_WIDTH / 2;\nconst CENTER_Y_POS = MAP_HEIGHT / 2;\n\nconst INPUT_WIDTH = (MAP_WIDTH / NN_SQUARE_SIZE) * 2;\nconst INPUT_HEIGHT = (MAP_HEIGHT / NN_SQUARE_SIZE) * 2;\nconst INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;\nconst OUTPUT_NEURONS = 16;\n\nconst STARTING_LIVES = 5;\n\n/* Codespace = {\n    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer\n} */\n\nclass Bot {\n    constructor(id) {\n        this.id = id;\n        this.xPos = 450;\n        this.yPos = 150;\n        this.rotation = 90;\n        this.bullets = [];\n        this.lives = STARTING_LIVES;\n\n        if (this.id > 1) {\n            this.xPos = 650;\n            this.rotation = 180;\n        }\n    }\n\n    initializeGenome() {\n        this.genes = [];\n    }\n\n    loadGenome(genome) {\n        genome.genes.forEach(function (gene) {\n            this.genes.append(Object.assign({}, gene));\n        });\n\n        initializeNeurons()\n    }\n\n    createNeuron() {\n        return {\n            sum: 0\n        };\n    }\n\n    initializeNeurons() {\n        this.neurons = [];\n\n        for (let i = 0; i++; i < INPUT_NEURONS) {\n            this.neurons.append(createNeuron())\n        }\n\n        for (let i = 0; i++; i < INPUT_NEURONS) {\n            this.neurons[MAX_NEURONS+i] = createNeuron();\n        }\n    }\n\n    createOutputObject() {\n\n        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not\n        return {\n            dx: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object\n            dy: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object\n            dh: Math.round(Math.random() * 30) - 14, // -15 -> 15, 5 bit object\n            ds: Math.round(Math.random()),\n        }\n\n    }\n\n    updateNetwork(inputs) {\n        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)\n        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)\n        this.drawBrainView(translatedPositions);\n    }\n\n    updateBotPosition(xPos, yPos, rotation) {\n        this.xPos = xPos\n        this.yPos = yPos\n        this.rotation = rotation\n    }\n\n    translateObjectPositions(otherPlayer) {\n        const playerXPos = this.xPos;\n        const playerYPos = this.yPos;\n        const rotationAngle =  Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"degreesToRadians\"])(-this.rotation);\n        const centerPointX = MAP_WIDTH / 2;\n        const centerPointY = MAP_HEIGHT / 2;\n        const translationMatrix = [centerPointX - this.xPos, centerPointY - this.yPos];\n\n        const otherPlayerRotated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"rotateAroundPoint\"])(this.xPos, this.yPos, rotationAngle, [otherPlayer.xPos, otherPlayer.yPos]);\n        const otherPlayerTranslated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"translateMatrix\"])(translationMatrix, otherPlayerRotated);\n\n        return {\n            xPos: otherPlayerTranslated[0],\n            yPos: otherPlayerTranslated[1],\n            bullets: otherPlayer.bullets.map((bullet) => {\n                const bulletRotated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"rotateAroundPoint\"])(playerXPos, playerYPos, rotationAngle, [bullet.xPos, bullet.yPos]);\n                const bulletTranslated = Object(_math__WEBPACK_IMPORTED_MODULE_0__[\"translateMatrix\"])(translationMatrix, bulletRotated);\n                return {\n                    xPos: bulletTranslated[0],\n                    yPos: bulletTranslated[1]\n                }\n            })\n        }\n    }\n\n    drawBrainView(translatedPositions) {\n        var canvas = document.getElementById('bot' + this.id + 'brain');\n        if (canvas.getContext) {\n            var ctx = canvas.getContext('2d');\n            const playerBGColor = this.id == 1 ? \"#ffdddd\" : \"#ddddff\";\n            const playerColor = this.id == 1 ? \"#ff0000\" : \"#0000ff\";\n            const enemyColor = this.id == 1 ? \"#0000ff\" : \"#ff0000\";\n            ctx.fillStyle = playerBGColor;\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n            // Draw player, always in center. \n            ctx.fillStyle = playerColor;\n            const scaledXPos = this.scaleForBrain(CENTER_X_POS);\n            const scaledYPos = this.scaleForBrain(CENTER_Y_POS);\n            ctx.fillRect(scaledXPos, scaledYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);\n\n            //Draw other player and objects, translated to how this brain sees them. \n            ctx.fillStyle = enemyColor;\n            const opponentXPos = this.scaleForBrain(translatedPositions.xPos);\n            const opponentYPos = this.scaleForBrain(translatedPositions.yPos);\n            ctx.fillRect(opponentXPos, opponentYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);\n\n            ctx.fillStyle = \"#000000\";\n            translatedPositions.bullets.forEach((bullet) => {\n                const bulletXPos = this.scaleForBrain(bullet.xPos);\n                const bulletYPos = this.scaleForBrain(bullet.yPos);\n                ctx.fillRect(bulletXPos, bulletYPos, BRAIN_CANVAS_SCALE, BRAIN_CANVAS_SCALE);\n            });\n\n        }\n    }\n\n    // Scales a value to display correctly on the brain graph\n    scaleForBrain(value) {\n        // We find the square of the neural network (each are NN_SQUARE_SIZE in width and height)\n        // Place the object in the one it's inside, and then scale based on the size of this brain canvas. \n        return Math.floor(value / NN_SQUARE_SIZE) * BRAIN_CANVAS_SCALE;\n    }\n\n    update(inputs) {\n        this.updateNetwork(inputs)\n        return this.createOutputObject()\n    }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Bot);\n\n\n//# sourceURL=webpack:///./src/bot.js?");

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
/*! exports provided: distanceBetweenPoints, translateMatrix, rotateMatrix, rotateAroundPoint, degreesToRadians, multiplyMatrixAndPoint */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"distanceBetweenPoints\", function() { return distanceBetweenPoints; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"translateMatrix\", function() { return translateMatrix; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"rotateMatrix\", function() { return rotateMatrix; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"rotateAroundPoint\", function() { return rotateAroundPoint; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"degreesToRadians\", function() { return degreesToRadians; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"multiplyMatrixAndPoint\", function() { return multiplyMatrixAndPoint; });\n\n\nfunction distanceBetweenPoints(x1, y1, x2, y2) {\n    var a = x1 - x2;\n    var b = y1 - y2;\n    return Math.sqrt(a*a + b*b);\n}\n\nfunction translateMatrix(matrix, point) {\n    const resultX = matrix[0] + point[0];\n    const resultY = matrix[1] + point[1];\n\n    return [resultX, resultY];\n}\n\nfunction rotateMatrix(matrix, point) {\n    const resultX = matrix[0][0] * point[0] + matrix[0][1] * point[1];\n    const resultY = matrix[1][0] * point[0] + matrix[1][1] * point[1];\n\n    return [resultX, resultY];\n}\n\nfunction rotateAroundPoint(pivotX, pivotY, angle, point) {\n    const s = Math.sin(angle);\n    const c = Math.cos(angle);\n\n    point[0] -= pivotX;\n    point[1] -= pivotY;\n\n    const rotatedX = point[0] * c - point[1] * s;\n    const rotatedY = point[0] * s + point[1] * c;\n\n    const resultX = rotatedX + pivotX;\n    const resultY = rotatedY + pivotY;\n\n    return [resultX, resultY];\n}\n\nfunction degreesToRadians(degrees) {\n    return degrees * Math.PI / 180\n}\n\nfunction multiplyMatrixAndPoint(matrix, point) {\n\n    var x = point[0];\n    var y = point[1];\n    var w = 1;\n    \n    var resultX = (x * matrix[0][0]) + (y * matrix[0][1]) + (w * matrix[0][2]);\n    var resultY = (x * matrix[1][0]) + (y * matrix[1][1]) + (w * matrix[1][2]);\n    \n    return [resultX, resultY];\n  }\n\n//# sourceURL=webpack:///./src/math.js?");

/***/ })

/******/ });