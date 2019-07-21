export const MAX_NEURONS = 10e4;
export const MAP_WIDTH = 1000; 
export const MAP_HEIGHT = 500; 

// The brain is 2x the size of the map because the player is centered in the brain 
// so if player is in top left and other in bottom right it needs enough room to show them
export const BRAIN_WIDTH = MAP_WIDTH * 2; 
export const BRAIN_HEIGHT = MAP_HEIGHT * 2;

export const BRAIN_CANVAS_WIDTH = 400;

export const NN_SQUARE_SIZE = 50;
export const BRAIN_CANVAS_SCALE = (BRAIN_CANVAS_WIDTH / (BRAIN_WIDTH / NN_SQUARE_SIZE)); 

export const INPUT_WIDTH = BRAIN_WIDTH / NN_SQUARE_SIZE;
export const INPUT_HEIGHT = BRAIN_HEIGHT / NN_SQUARE_SIZE;
export const INPUT_NEURONS = INPUT_WIDTH * INPUT_HEIGHT;

export const OUTPUT_NEURONS = 7;

export const STARTING_LIVES = 5;

export const TICK_TIME = 75;

export const BOT_SIZE = 36;
export const MAX_SPEED = 15;
// export const MOVE_SPEED_MULTIPLIER = 2;

export const BULLET_SIZE = 20;
export const BULLET_SPEED = 20;

export const PLAYER1_START_X = 36;
export const PLAYER1_START_Y = 260;
export const PLAYER1_START_ROTATION = 0;

export const PLAYER2_START_X = 964;
export const PLAYER2_START_Y = 260;
export const PLAYER2_START_ROTATION = 180;

export const DELTA_DISJOINT = 2;
export const DELTA_WEIGHTS = 0.4;
export const DELTA_THRESHOLD = 1;
