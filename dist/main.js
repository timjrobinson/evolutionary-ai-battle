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
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nconst BOT_SIZE = 25;\nconst MAX_SPEED = 15;\n\nconst MAP_WIDTH = 1000;\nconst MAP_HEIGHT = 500;\n\nconst MAX_X_POS = MAP_WIDTH - BOT_SIZE;\nconst MAX_Y_POS = MAP_HEIGHT - BOT_SIZE;\n\nclass Battleground {\n    constructor() {\n        this.bots = [];\n        this.bullets = [];\n    }\n\n    addBots(bot1, bot2) {\n        this.bots.push(bot1)\n        this.bots.push(bot2)\n    }\n\n    start() {\n        console.log(\"Starting battleground\");\n        setInterval(this.update.bind(this), 75);\n    }\n\n    updateBot(bot, otherBot) {\n        const gameState = {\n            xPos: bot.xPos,\n            yPos: bot.yPos,\n            rotation: bot.rotation,\n            otherPlayer: {\n                xPos: otherBot.xPos,\n                yPos: otherBot.yPos,\n                rotation: otherBot.rotation\n            }\n        }\n        const botActions = bot.update(gameState);\n\n        const xMovement = Math.min(botActions.dx, MAX_SPEED);\n        const yMovement = Math.min(botActions.dy, MAX_SPEED);\n        const rotation = Math.min(botActions.dh, MAX_SPEED);\n\n        bot.xPos = Math.min(Math.max(bot.xPos + xMovement, 0), MAX_X_POS);\n        bot.yPos = Math.min(Math.max(bot.yPos + yMovement, 0), MAX_Y_POS);\n        bot.rotation += rotation;\n\n        // bot.bullets.forEach(function(bullet) {\n            //bulletMove = TODO: Calculate where the bullet is going based on its xPos/yPos/rotation\n        // });\n\n        if (botActions.ds && bot.bullets.length < 5) {\n            let bullet = this.spawnBullet(bot.xPos, bot.yPos, bot.rotation);\n        }\n    }\n\n    spawnBullet(xPos, yPos, rotation) {\n\n    }\n\n    update() {\n        this.updateBot(this.bots[0], this.bots[1]);\n        this.updateBot(this.bots[1], this.bots[0]);\n    }\n}\n\nmodule.exports = Battleground;\n\n//# sourceURL=webpack:///./src/battleground.js?");

/***/ }),

/***/ "./src/bot.js":
/*!********************!*\
  !*** ./src/bot.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nconst MAX_NEURONS = 10e5;\nconst MAP_WIDTH = 1000; \nconst MAP_HEIGHT = 500; \nconst NN_SQUARE_SIZE = 25;\nconst BRAIN_SCALE = 10;\n\nconst INPUT_WIDTH = (MAP_WIDTH / NN_SQUARE_SIZE) * 2;\nconst INPUT_HEIGHT = (MAP_HEIGHT / NN_SQUARE_SIZE) * 2;\nconst INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;\nconst OUTPUT_NEURONS = 16;\n\n/* Codespace = {\n    dx, dy, dh, ds, xPos, yPos, rotation, bullets, otherPlayer\n} */\n\nclass Bot {\n    constructor(id) {\n        this.id = id;\n        this.xPos = 50;\n        this.yPos = 250;\n        this.rotation = 0;\n\n        if (this.id > 1) {\n            this.xPos = 950;\n            this.rotation = 180;\n        }\n    }\n\n    initializeGenome() {\n        this.genes = [];\n    }\n\n    loadGenome(genome) {\n        genome.genes.forEach(function (gene) {\n            this.genes.append(Object.assign({}, gene));\n        });\n\n        initializeNeurons()\n    }\n\n    createNeuron() {\n        return {\n            sum: 0\n        };\n    }\n\n    initializeNeurons() {\n        this.neurons = [];\n\n        for (let i = 0; i++; i < INPUT_NEURONS) {\n            this.neurons.append(createNeuron())\n        }\n\n        for (let i = 0; i++; i < INPUT_NEURONS) {\n            this.neurons[MAX_NEURONS+i] = createNeuron();\n        }\n    }\n\n    createOutputObject() {\n        // There should be a total of 16 output nodes, 5 bits for each movement / rotation and another bit on if it should shoot or not\n        return {\n            dx: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object\n            dy: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object\n            dh: Math.round(Math.random() * 30) - 15, // -15 -> 15, 5 bit object\n            ds: false,\n        }\n\n    }\n\n    updateNetwork(inputs) {\n        console.log(\"In updateNetwork, inputs is: \", inputs);\n        this.updateBotPosition(inputs.xPos, inputs.yPos, inputs.rotation)\n        const translatedPositions = this.translateObjectPositions(inputs.otherPlayer)\n        this.drawBrainView(translatedPositions);\n    }\n\n    updateBotPosition(xPos, yPos, rotation) {\n        this.xPos = xPos\n        this.yPos = yPos\n        this.rotation = rotation\n    }\n\n    translateObjectPositions(otherPlayer) {\n        const rotationMatrix = []; // Create based on the players rotation, we want to rotate the world around this point \n        const transposeMatrix = []; // Create based on players position, we want to ensure this bot is always the center of the world. \n        return {\n            xPos: otherPlayer.xPos,\n            yPos: otherPlayer.yPos,\n            rotation: otherPlayer.rotation,\n            bullets: otherPlayer.bullets\n        }\n    }\n\n    drawBrainView() {\n        var canvas = document.getElementById('bot' + this.id + 'brain');\n        if (canvas.getContext) {\n            var ctx = canvas.getContext('2d');\n            let fillStyle = \"#ffdddd\";\n            if (this.id == 2) {\n                fillStyle = \"#ddddff\"\n            }\n            ctx.fillStyle = fillStyle;\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n            ctx.fillStyle = \"#000000\";\n            const translatedXPos = Math.round(this.xPos / NN_SQUARE_SIZE * BRAIN_SCALE);\n            const translatedYPos = Math.round(this.yPos / NN_SQUARE_SIZE * BRAIN_SCALE);\n            console.log(\"Drawing at: \", translatedXPos, \" \", translatedYPos, \" \", BRAIN_SCALE);\n            ctx.fillRect(translatedXPos, translatedYPos, BRAIN_SCALE, BRAIN_SCALE);\n        }\n    }\n\n    update(inputs) {\n        this.updateNetwork(inputs)\n        return this.createOutputObject()\n    }\n}\n\nmodule.exports = Bot;\n\n\n//# sourceURL=webpack:///./src/bot.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _bot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bot */ \"./src/bot.js\");\n/* harmony import */ var _bot__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_bot__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _battleground__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./battleground */ \"./src/battleground.js\");\n/* harmony import */ var _battleground__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_battleground__WEBPACK_IMPORTED_MODULE_1__);\n// The main file that will import the battleground and bot and play bots against each other\n\n\n\n\nconst bot1 = new _bot__WEBPACK_IMPORTED_MODULE_0___default.a(1);\nconst bot2 = new _bot__WEBPACK_IMPORTED_MODULE_0___default.a(2);\n\nconst inputs = {\n    xPos: 5,\n    yPos: 5,\n    rotation: 0,\n    otherPlayer: {\n        xPos: 50,\n        yPos: 5,\n        rotation: 0\n    }\n}\n\n// const commands = bot.update(inputs);\n\nconst battleground = new _battleground__WEBPACK_IMPORTED_MODULE_1___default.a()\nbattleground.addBots(bot1, bot2);\nbattleground.start();\n\n// const codespace = Object.assign({}, commands);\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });