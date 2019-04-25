"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MAX_NEURONS = exports.MAX_NEURONS = 10e4;
var MAP_WIDTH = exports.MAP_WIDTH = 1000;
var MAP_HEIGHT = exports.MAP_HEIGHT = 500;

// The brain is 2x the size of the map because the player is centered in the brain 
// so if player is in top left and other in bottom right it needs enough room to show them
var BRAIN_WIDTH = exports.BRAIN_WIDTH = MAP_WIDTH * 2;
var BRAIN_HEIGHT = exports.BRAIN_HEIGHT = MAP_HEIGHT * 2;

var BRAIN_CANVAS_WIDTH = exports.BRAIN_CANVAS_WIDTH = 400;

var NN_SQUARE_SIZE = exports.NN_SQUARE_SIZE = 50;
var BRAIN_CANVAS_SCALE = exports.BRAIN_CANVAS_SCALE = BRAIN_CANVAS_WIDTH / (BRAIN_WIDTH / NN_SQUARE_SIZE);

var INPUT_WIDTH = exports.INPUT_WIDTH = BRAIN_WIDTH / NN_SQUARE_SIZE;
var INPUT_HEIGHT = exports.INPUT_HEIGHT = BRAIN_HEIGHT / NN_SQUARE_SIZE;
var INPUT_NEURONS = exports.INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;

var OUTPUT_NEURONS = exports.OUTPUT_NEURONS = 7;

var STARTING_LIVES = exports.STARTING_LIVES = 5;

var TICK_TIME = exports.TICK_TIME = 75;

var BOT_SIZE = exports.BOT_SIZE = 36;
var MAX_SPEED = exports.MAX_SPEED = 15;
// export const MOVE_SPEED_MULTIPLIER = 2;

var BULLET_SIZE = exports.BULLET_SIZE = 20;
var BULLET_SPEED = exports.BULLET_SPEED = 20;

var PLAYER1_START_X = exports.PLAYER1_START_X = 36;
var PLAYER1_START_Y = exports.PLAYER1_START_Y = 350;
var PLAYER1_START_ROTATION = exports.PLAYER1_START_ROTATION = 0;

var PLAYER2_START_X = exports.PLAYER2_START_X = 964;
var PLAYER2_START_Y = exports.PLAYER2_START_Y = 350;
var PLAYER2_START_ROTATION = exports.PLAYER2_START_ROTATION = 180;

var DELTA_DISJOINT = exports.DELTA_DISJOINT = 2;
var DELTA_WEIGHTS = exports.DELTA_WEIGHTS = 0.4;
var DELTA_THRESHOLD = exports.DELTA_THRESHOLD = 1;