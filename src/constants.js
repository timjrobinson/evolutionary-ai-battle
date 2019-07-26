// The brain is 2x the size of the map because the player is centered in the brain 
// so if player is in top left and other in bottom right it needs enough room to show them

import config from '../config/default.json'

export const BRAIN_WIDTH = config.mapWidth * 2; 
export const BRAIN_HEIGHT = config.mapHeight * 2;

export const BRAIN_CANVAS_WIDTH = 400;
export const BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (BRAIN_WIDTH / config.neuralNetworkSquareSize)); 

export const INPUT_WIDTH = BRAIN_WIDTH / config.neuralNetworkSquareSize;
export const INPUT_HEIGHT = BRAIN_HEIGHT / config.neuralNetworkSquareSize;
export const INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;

export const OUTPUT_NEURONS = 7;