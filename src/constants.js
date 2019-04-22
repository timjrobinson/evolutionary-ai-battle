export const MAX_NEURONS = 10e4;
export const MAP_WIDTH = 1000; 
export const MAP_HEIGHT = 500; 

// The brain is 2x the size of the map because the player is centered in the brain 
// so if player is in top left and other in bottom right it needs enough room to show them
export const BRAIN_WIDTH = MAP_WIDTH * 2; 
export const BRAIN_HEIGHT = MAP_HEIGHT * 2;

export const BRAIN_CANVAS_WIDTH = 400;

export const NN_SQUARE_SIZE = 100;
export const BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (BRAIN_WIDTH / NN_SQUARE_SIZE)); 

export const INPUT_WIDTH = BRAIN_WIDTH / NN_SQUARE_SIZE;
export const INPUT_HEIGHT = BRAIN_HEIGHT / NN_SQUARE_SIZE;
export const INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;

export const OUTPUT_NEURONS = 16;

export const STARTING_LIVES = 5;